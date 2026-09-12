param(
    [ValidateSet('list', 'add', 'remove', 'require', 'unrequire', 'doctor')]
    [string]$Action = 'list',
    [ValidateSet('global', 'project', 'both')]
    [string]$Scope = 'both',
    [string]$Plugin,
    [string]$Marketplace,
    [string]$ProjectPath = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

function Get-CodexPath {
    $command = Get-Command codex -ErrorAction SilentlyContinue
    if (-not $command) { throw 'codex command was not found in PATH.' }
    return $command.Source
}

function Get-Selector([string]$Name, [string]$Market) {
    if ([string]::IsNullOrWhiteSpace($Name)) {
        throw 'Use -Plugin <name> or <name>@<marketplace>.'
    }
    if ($Name.Contains('@')) { return $Name }
    if ([string]::IsNullOrWhiteSpace($Market)) {
        throw "For plugin '$Name', use -Marketplace or a complete name@marketplace selector."
    }
    return "$Name@$Market"
}

function Invoke-CodexPlugin([string[]]$Arguments) {
    $codex = Get-CodexPath
    & $codex plugin @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "codex plugin exited with code $LASTEXITCODE."
    }
}

function Get-ManifestFile {
    $root = [IO.Path]::GetFullPath($ProjectPath)
    return Join-Path (Join-Path $root '.codex-kit') 'plugins.json'
}

function Read-ProjectManifest {
    $file = Get-ManifestFile
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        return [pscustomobject]@{ plugins = @() }
    }
    $manifest = (Get-Content -LiteralPath $file -Raw -Encoding UTF8) | ConvertFrom-Json
    if ($null -eq $manifest.plugins) { $manifest | Add-Member -NotePropertyName plugins -NotePropertyValue @() }
    return $manifest
}

function Write-ProjectManifest($Manifest) {
    $file = Get-ManifestFile
    New-Item -ItemType Directory -Path (Split-Path -Parent $file) -Force | Out-Null
    $Manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $file -Encoding UTF8
    Write-Output "Project plugin manifest: $file"
}

function Get-InstalledPluginIds {
    $codex = Get-CodexPath
    $json = & $codex plugin list --json
    if ($LASTEXITCODE -ne 0) { throw "codex plugin list exited with code $LASTEXITCODE." }
    $data = $json | ConvertFrom-Json
    @($data.installed | ForEach-Object {
        if ($_.pluginId) { $_.pluginId } elseif ($_.id) { $_.id }
    })
}

if ($Action -in @('add', 'remove') -and $Scope -eq 'project') {
    throw "Codex has no real project scope for plugin '$Action'. Use -Action require to record a project requirement."
}

if ($Action -eq 'add') {
    Invoke-CodexPlugin @('add', (Get-Selector $Plugin $Marketplace))
    exit 0
}

if ($Action -eq 'remove') {
    Invoke-CodexPlugin @('remove', (Get-Selector $Plugin $Marketplace))
    exit 0
}

if ($Action -in @('require', 'unrequire')) {
    if ($Scope -eq 'global') { throw "Action '$Action' is for project scope." }
    $selector = Get-Selector $Plugin $Marketplace
    $manifest = Read-ProjectManifest
    $items = @($manifest.plugins | ForEach-Object { [string]$_ })
    if ($Action -eq 'require') {
        if ($items -notcontains $selector) { $items += $selector }
    } else {
        $items = @($items | Where-Object { $_ -ne $selector })
    }
    $manifest.plugins = @($items | Sort-Object -Unique)
    Write-ProjectManifest $manifest
    exit 0
}

if ($Scope -in @('global', 'both')) {
    Write-Output 'Global plugins:'
    Invoke-CodexPlugin @('list')
}

if ($Scope -in @('project', 'both')) {
    $file = Get-ManifestFile
    if (Test-Path -LiteralPath $file -PathType Leaf) {
        $manifest = Read-ProjectManifest
        Write-Output "Project requirements: $file"
        @($manifest.plugins) | ForEach-Object { Write-Output "  $_" }
        if ($Action -eq 'doctor') {
            $installed = @(Get-InstalledPluginIds)
            $missing = @($manifest.plugins | Where-Object { $_ -notin $installed })
            if ($missing.Count) { Write-Warning "Missing from global installation: $($missing -join ', ')" }
            else { Write-Output 'Project plugin requirements: OK' }
        }
    } elseif ($Action -eq 'doctor') {
        Write-Output "Project requirements are absent: $file"
    }
}
