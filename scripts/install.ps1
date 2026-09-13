param(
    [string]$Block,
    [string]$Skill,
    [string]$Stack,
    [string]$Target,
    [string]$ProjectPath,
    [string]$Remove,
    [switch]$Force,
    [switch]$New,
    [switch]$List,
    [switch]$Doctor
)

$ErrorActionPreference = 'Stop'
$Kit = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($Target)) {
    $Target = Join-Path (Get-Location).Path '.agents\skills'
}

if ($Remove) {
    if ($Block -or $Skill -or $Stack -or $ProjectPath -or $New -or $Force -or $List -or $Doctor) {
        throw '-Remove cannot be combined with other operations.'
    }
    if ($Remove -match '[\\/]') {
        throw '-Remove accepts one skill name, not a path.'
    }
    $removePath = Join-Path $Target $Remove
    if (-not (Test-Path -LiteralPath $removePath -PathType Container)) {
        throw "Skill not found in target: $removePath"
    }
    Remove-Item -LiteralPath $removePath -Recurse -Force
    Write-Output "Removed: $Remove"
    exit 0
}

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

function Get-SkillName([string]$Path) {
    $raw = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
    $match = [regex]::Match($raw, '(?m)^name:\s*(.+?)\s*$')
    if (-not $match.Success) { throw "Skill has no name: $Path" }
    return $match.Groups[1].Value.Trim().Trim([char]34, [char]39)
}

function Get-SkillFile([string]$Name) {
    if ($Name -match '[\\/]') { throw '-Skill accepts one skill name, not a path.' }
    $matches = @(Get-ChildItem -LiteralPath (Join-Path $Kit 'blocks') -Recurse -File -Filter 'SKILL.md' |
        Where-Object { (Get-SkillName $_.FullName) -eq $Name })
    if ($matches.Count -eq 0) { throw "Skill not found: $Name" }
    if ($matches.Count -gt 1) { throw "Skill name is ambiguous: $Name ($($matches.FullName -join ', '))" }
    return $matches[0]
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
        Install-Skill (Get-SkillName $file.FullName) $file.FullName
    }

    $commands = Join-Path $Kit "blocks\$Name\commands"
    if (Test-Path -LiteralPath $commands) {
        foreach ($file in Get-ChildItem -LiteralPath $commands -File -Filter '*.md') {
            $skillName = "$Name-$($file.BaseName)"
            $tempDir = Join-Path ([IO.Path]::GetTempPath()) "$skillName-$([guid]::NewGuid().ToString('N'))"
            $temp = Join-Path $tempDir 'SKILL.md'
            New-Item -ItemType Directory -Path $tempDir | Out-Null
            try {
                $body = Get-Content -Raw -Encoding UTF8 $file.FullName
                @("---", "name: $skillName", "description: Codex skill generated from block command $Name.", "---", "", $body) |
                    Set-Content -Encoding UTF8 -LiteralPath $temp
                Install-Skill $skillName $temp
            } finally {
                Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
            }
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

if (@($Block, $Skill, $Stack | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -gt 1) {
    throw 'Use one of -Block, -Skill, or -Stack.'
}
if (-not $Block -and -not $Skill -and -not $Stack) { throw 'Use -Block, -Skill, or -Stack.' }
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
if ($Skill) {
    $file = Get-SkillFile $Skill
    Install-Skill (Get-SkillName $file.FullName) $file.FullName
    exit 0
}
foreach ($name in $names) { Install-Block $name }
