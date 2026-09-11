param(
    [string]$Block,
    [string]$Stack,
    [string]$Target = (Join-Path (Get-Location) '.agents\skills'),
    [string]$ProjectPath,
    [switch]$Force,
    [switch]$New,
    [switch]$List,
    [switch]$Doctor
)

$ErrorActionPreference = 'Stop'
$Kit = Split-Path -Parent $PSScriptRoot

function Get-StackBlocks([string]$Name) {
    $file = Join-Path $Kit "stacks\$Name\stack.yaml"
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Stack not found: $Name"
    }
    $raw = Get-Content -Raw -Encoding UTF8 $file
    $match = [regex]::Match($raw, '(?m)^blocks:\s*\[(.*?)\]\s*$')
    if (-not $match.Success -or [string]::IsNullOrWhiteSpace($match.Groups[1].Value)) { return @() }
    return @($match.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Get-BlockSkillFiles([string]$Name) {
    $dir = Join-Path $Kit "blocks\$Name\skills"
    if (-not (Test-Path -LiteralPath $dir)) { throw "Block not found or has no skills: $Name" }
    return @(Get-ChildItem -LiteralPath $dir -Recurse -File -Filter 'SKILL.md')
}

function Install-Skill([string]$Name, [string]$Source) {
    $dest = Join-Path $Target $Name
    if (Test-Path -LiteralPath $dest) {
        if (-not $Force) { Write-Warning "Skip ${Name}: already exists. Use -Force to replace."; return }
        Remove-Item -LiteralPath $dest -Recurse -Force
    }
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
    Copy-Item -LiteralPath (Split-Path -Parent $Source) -Destination $dest -Recurse -Force
    Write-Output "Installed: $Name"
}

function Install-Block([string]$Name) {
    $files = Get-BlockSkillFiles $Name
    foreach ($file in $files) {
        Install-Skill $file.Directory.Name $file.FullName
    }

    $commands = Join-Path $Kit "blocks\$Name\commands"
    if (Test-Path -LiteralPath $commands) {
        foreach ($file in Get-ChildItem -LiteralPath $commands -File -Filter '*.md') {
            $skillName = "$Name-$($file.BaseName)"
            $temp = Join-Path ([IO.Path]::GetTempPath()) "$skillName-SKILL.md"
            $body = Get-Content -Raw -Encoding UTF8 $file.FullName
            @("---", "name: $skillName", "description: Codex skill generated from block command $Name.", "---", "", $body) |
                Set-Content -Encoding UTF8 -LiteralPath $temp
            Install-Skill $skillName $temp
            Remove-Item -LiteralPath $temp -Force
        }
    }
}

if ($List) {
    Get-ChildItem -Directory (Join-Path $Kit 'blocks') | ForEach-Object { $_.Name }
    exit 0
}

if ($Doctor) {
    $blocks = @(Get-ChildItem -Directory (Join-Path $Kit 'blocks'))
    $skills = @(Get-ChildItem -Recurse -File (Join-Path $Kit 'blocks') -Filter 'SKILL.md')
    $missing = @($blocks | Where-Object { -not (Test-Path (Join-Path $_.FullName 'block.yaml')) })
    $bad = @($skills | Where-Object { (Get-Content -Raw -Encoding UTF8 $_.FullName) -notmatch '(?m)^---\s*\r?\n' })
    Write-Output "Blocks: $($blocks.Count)"
    Write-Output "SKILL.md: $($skills.Count)"
    if ($missing.Count) { throw "Missing block.yaml: $($missing.Name -join ', ')" }
    if ($bad.Count) { throw "Missing YAML frontmatter: $($bad.FullName -join ', ')" }
    Write-Output 'Doctor: OK'
    exit 0
}

if ($Block -and $Stack) { throw 'Use either -Block or -Stack.' }
if (-not $Block -and -not $Stack) { throw 'Use -Block or -Stack.' }
if ($New -and (-not $Stack -or -not $ProjectPath)) { throw 'New requires Stack and ProjectPath.' }

if ($New) {
    $repo = Join-Path $Kit "stacks\$Stack\repo"
    if (-not (Test-Path -LiteralPath $repo)) { throw "Stack template not found: $Stack" }
    if ((Test-Path -LiteralPath $ProjectPath) -and @(Get-ChildItem -Force -LiteralPath $ProjectPath).Count) {
        throw "Project directory is not empty: $ProjectPath"
    }
    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    foreach ($item in Get-ChildItem -Force -LiteralPath $repo) {
        if ($item.Name -eq '.gitkeep') { continue }
        $name = if ($item.Name -eq 'gitignore') { '.gitignore' } else { $item.Name }
        Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $ProjectPath $name) -Recurse -Force
    }
    Get-ChildItem -Recurse -File -LiteralPath $ProjectPath | Where-Object { $_.Extension -in @('.md', '.yaml', '.yml', '.json', '.txt') } | ForEach-Object {
        $raw = Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName
        Set-Content -Encoding UTF8 -LiteralPath $_.FullName -Value $raw.Replace('{{PROJECT_NAME}}', (Split-Path -Leaf $ProjectPath))
    }
    $Target = Join-Path $ProjectPath '.agents\skills'
}

$names = if ($Stack) { Get-StackBlocks $Stack } else { @($Block) }
if ($Stack -and $names.Count -eq 0) { Write-Output "Stack $Stack has no blocks." }
foreach ($name in $names) { Install-Block $name }
