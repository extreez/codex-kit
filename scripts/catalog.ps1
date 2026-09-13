param(
    [switch]$Write,
    [switch]$Check
)

$ErrorActionPreference = 'Stop'
$Kit = Split-Path -Parent $PSScriptRoot
$CatalogFile = Join-Path $Kit 'catalog.json'

if ($Write -and $Check) { throw 'Use either -Write or -Check.' }

function Get-FrontmatterValue([string]$Path, [string]$Name) {
    $lines = Get-Content -Encoding UTF8 -LiteralPath $Path
    for ($index = 0; $index -lt $lines.Count; $index++) {
        $match = [regex]::Match($lines[$index], "^$([regex]::Escape($Name)):\s*(.+?)\s*$")
        if (-not $match.Success) { continue }
        $value = $match.Groups[1].Value.Trim().Trim([char]34, [char]39)
        if ($value -notmatch '^[>|][-+]?$') { return $value }
        $parts = @()
        for ($next = $index + 1; $next -lt $lines.Count -and $lines[$next] -match '^\s+(.+)$'; $next++) {
            $parts += $matches[1].Trim()
        }
        return $parts -join ' '
    }
    return ''
}

$blocks = @()
$skills = @()
foreach ($blockDir in Get-ChildItem -LiteralPath (Join-Path $Kit 'blocks') -Directory | Sort-Object Name) {
    $blockSkills = @()
    foreach ($skillFile in Get-ChildItem -LiteralPath (Join-Path $blockDir.FullName 'skills') -Recurse -File -Filter 'SKILL.md' -ErrorAction SilentlyContinue | Sort-Object FullName) {
        $name = Get-FrontmatterValue $skillFile.FullName 'name'
        if ([string]::IsNullOrWhiteSpace($name)) { throw "Skill has no name: $($skillFile.FullName)" }
        $path = $skillFile.Directory.FullName.Substring($Kit.Length + 1).Replace('\', '/')
        $item = [ordered]@{
            name = $name
            description = Get-FrontmatterValue $skillFile.FullName 'description'
            block = $blockDir.Name
            path = $path
        }
        $blockSkills += $item
        $skills += $item
    }
    $blocks += [ordered]@{
        name = $blockDir.Name
        path = "blocks/$($blockDir.Name)"
        skills = $blockSkills
    }
}

$stacks = @()
foreach ($stackFile in Get-ChildItem -LiteralPath (Join-Path $Kit 'stacks') -Recurse -File -Filter 'stack.yaml' | Sort-Object FullName) {
    $raw = Get-Content -Raw -Encoding UTF8 -LiteralPath $stackFile.FullName
    $match = [regex]::Match($raw, '(?m)^blocks:\s*\[(.*?)\]\s*$')
    if (-not $match.Success) { throw "Stack has no blocks list: $($stackFile.FullName)" }
    $stacks += [ordered]@{
        name = Split-Path -Leaf (Split-Path -Parent $stackFile.FullName)
        blocks = @($match.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    }
}

$catalog = [ordered]@{
    schemaVersion = 1
    skills = @($skills | Sort-Object name)
    blocks = $blocks
    stacks = $stacks
}
$json = ($catalog | ConvertTo-Json -Depth 8) + [Environment]::NewLine

if ($Check) {
    if (-not (Test-Path -LiteralPath $CatalogFile -PathType Leaf)) { throw 'catalog.json is missing. Run scripts/catalog.ps1 -Write.' }
    $actual = (Get-Content -Raw -Encoding UTF8 -LiteralPath $CatalogFile).TrimEnd("`r", "`n")
    $expected = $json.TrimEnd("`r", "`n")
    if ($actual -cne $expected) { throw 'catalog.json is stale. Run scripts/catalog.ps1 -Write.' }
    Write-Output 'catalog.json: OK'
    exit 0
}

if ($Write) {
    Set-Content -LiteralPath $CatalogFile -Encoding UTF8 -Value $json
    Write-Output "Wrote: $CatalogFile"
    exit 0
}

$json
