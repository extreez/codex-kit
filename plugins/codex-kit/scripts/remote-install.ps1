[CmdletBinding()]
param(
    [ValidateSet('search', 'list', 'add', 'update', 'doctor')]
    [string]$Action = 'search',
    [string]$Query,
    [string]$Name,
    [ValidateSet('skill', 'block', 'stack')]
    [string]$Kind,
    [string]$ProjectPath = (Get-Location).Path,
    [string]$Ref = 'main',
    [string]$Repository = 'https://github.com/extreez/codex-kit.git',
    [string]$CacheRoot
)

$ErrorActionPreference = 'Stop'

function Invoke-Git([string[]]$Arguments) {
    $stderr = [IO.Path]::GetTempFileName()
    $nativePreference = Get-Variable -Name PSNativeCommandUseErrorActionPreference -ValueOnly -ErrorAction SilentlyContinue
    $errorPreference = $ErrorActionPreference
    try {
        if ($null -ne $nativePreference) { $PSNativeCommandUseErrorActionPreference = $false }
        $ErrorActionPreference = 'SilentlyContinue'
        $output = & git @Arguments 2>$stderr
        $exitCode = $LASTEXITCODE
        $details = Get-Content -Raw -Encoding UTF8 -LiteralPath $stderr
    } finally {
        $ErrorActionPreference = $errorPreference
        if ($null -ne $nativePreference) { $PSNativeCommandUseErrorActionPreference = $nativePreference }
        Remove-Item -LiteralPath $stderr -Force -ErrorAction SilentlyContinue
    }
    if ($exitCode -ne 0) { throw "git $($Arguments -join ' ') failed: $details" }
    return @($output | ForEach-Object { "$_" })
}

function Get-ProjectRoot {
    return [IO.Path]::GetFullPath($ProjectPath)
}

function Get-LockFile {
    return Join-Path (Join-Path (Get-ProjectRoot) '.codex-kit') 'skills.lock.json'
}

function Read-Lock {
    $file = Get-LockFile
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        return [pscustomobject]@{ schemaVersion = 1; packages = @() }
    }
    $lock = (Get-Content -Raw -Encoding UTF8 -LiteralPath $file) | ConvertFrom-Json
    if ($null -eq $lock.packages) { $lock | Add-Member -NotePropertyName packages -NotePropertyValue @() }
    return $lock
}

function Write-Lock($Lock) {
    $file = Get-LockFile
    New-Item -ItemType Directory -Path (Split-Path -Parent $file) -Force | Out-Null
    $Lock | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -LiteralPath $file
    Write-Output "Project skill lock: $file"
}

function Get-CacheRepository {
    if ([string]::IsNullOrWhiteSpace($CacheRoot)) {
        $base = if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { [IO.Path]::GetTempPath() }
        $CacheRoot = Join-Path $base 'codex-kit'
    }
    $repo = Join-Path $CacheRoot 'source'
    if (-not (Test-Path -LiteralPath (Join-Path $repo '.git') -PathType Container)) {
        New-Item -ItemType Directory -Path $repo -Force | Out-Null
        Invoke-Git @('init', $repo) | Out-Null
        Invoke-Git @('-C', $repo, 'remote', 'add', 'origin', $Repository) | Out-Null
    } else {
        $remotes = @(Invoke-Git @('-C', $repo, 'remote'))
        if ($remotes -notcontains 'origin') {
            Invoke-Git @('-C', $repo, 'remote', 'add', 'origin', $Repository) | Out-Null
        } else {
            $origin = (Invoke-Git @('-C', $repo, 'remote', 'get-url', 'origin') | Select-Object -First 1).Trim()
            if ($origin.Trim() -eq $Repository) { return $repo }
            throw "Cache belongs to another repository: $origin"
        }
    }
    return $repo
}

function Get-SourceState {
    $repo = Get-CacheRepository
    Invoke-Git @('-C', $repo, 'fetch', '--depth', '1', 'origin', $Ref) | Out-Null
    $commit = (Invoke-Git @('-C', $repo, 'rev-parse', 'FETCH_HEAD') | Select-Object -First 1).Trim()
    $catalogJson = (Invoke-Git @('-C', $repo, 'show', "$($commit):catalog.json")) -join [Environment]::NewLine
    $catalog = $catalogJson | ConvertFrom-Json
    if ($catalog.schemaVersion -ne 1) { throw "Unsupported catalog schema: $($catalog.schemaVersion)" }
    return [pscustomobject]@{ Root = $repo; Commit = $commit; Catalog = $catalog }
}

function Get-CatalogItems($Catalog) {
    $items = @()
    foreach ($skill in @($Catalog.skills)) { $items += [pscustomobject]@{ kind = 'skill'; name = $skill.name; description = $skill.description; block = $skill.block; path = $skill.path } }
    foreach ($block in @($Catalog.blocks)) { $items += [pscustomobject]@{ kind = 'block'; name = $block.name; description = "Block with $(@($block.skills).Count) skills"; block = $block.name; path = $block.path } }
    foreach ($stack in @($Catalog.stacks)) { $items += [pscustomobject]@{ kind = 'stack'; name = $stack.name; description = "Stack with $(@($stack.blocks).Count) blocks"; block = ''; path = "stacks/$($stack.name)" } }
    return $items
}

function Resolve-CatalogItem($Catalog) {
    if ([string]::IsNullOrWhiteSpace($Name)) { throw 'Use -Name for -Action add.' }
    $matches = @(Get-CatalogItems $Catalog | Where-Object { $_.name -ieq $Name -and (-not $Kind -or $_.kind -eq $Kind) })
    if ($matches.Count -eq 0) { throw "Package not found: $Name. Run -Action search -Query $Name." }
    if ($matches.Count -gt 1) { throw "Package is ambiguous: $Name. Repeat with -Kind skill, block, or stack." }
    return $matches[0]
}

function Get-CheckoutPaths($Catalog, $Item) {
    $paths = @('scripts')
    if ($Item.kind -eq 'stack') {
        $stack = @($Catalog.stacks | Where-Object { $_.name -eq $Item.name })[0]
        $paths += "stacks/$($Item.name)"
        foreach ($blockName in @($stack.blocks)) {
            $block = @($Catalog.blocks | Where-Object { $_.name -eq $blockName })[0]
            if ($null -eq $block) { throw "Stack $($Item.name) references missing block: $blockName" }
            $paths += $block.path
        }
    } else {
        $paths += $Item.path
    }
    return @($paths | Sort-Object -Unique)
}

function Get-InstalledSkillNames($Catalog, $Item) {
    if ($Item.kind -eq 'skill') { return @($Item.name) }
    if ($Item.kind -eq 'block') {
        $block = @($Catalog.blocks | Where-Object { $_.name -eq $Item.name })[0]
        return @($block.skills | ForEach-Object { $_.name } | Sort-Object -Unique)
    }
    $stack = @($Catalog.stacks | Where-Object { $_.name -eq $Item.name })[0]
    $names = @()
    foreach ($blockName in @($stack.blocks)) {
        $block = @($Catalog.blocks | Where-Object { $_.name -eq $blockName })[0]
        $names += @($block.skills | ForEach-Object { $_.name })
    }
    return @($names | Sort-Object -Unique)
}

function Checkout-Source($State, $Paths) {
    Invoke-Git @('-C', $State.Root, 'sparse-checkout', 'init', '--cone') | Out-Null
    $setArgs = @('-C', $State.Root, 'sparse-checkout', 'set', '--cone') + $Paths
    Invoke-Git $setArgs | Out-Null
    Invoke-Git @('-C', $State.Root, 'checkout', '--detach', '--force', $State.Commit) | Out-Null
}

function Install-CatalogItem($State, $Item) {
    Checkout-Source $State (Get-CheckoutPaths $State.Catalog $Item)
    $target = Join-Path (Get-ProjectRoot) '.agents\skills'
    $parameter = "$($Item.kind.Substring(0, 1).ToUpperInvariant())$($Item.kind.Substring(1))"
    $installer = Join-Path $State.Root 'scripts\install.ps1'
    $installerArgs = @{ Target = $target }
    $installerArgs[$parameter] = $Item.name
    & $installer @installerArgs
    if ($LASTEXITCODE -ne 0) { throw "Installer failed for $($Item.kind) $($Item.name)." }

    $lock = Read-Lock
    $packages = @($lock.packages | Where-Object { -not ($_.kind -eq $Item.kind -and $_.name -eq $Item.name) })
    $packages += [pscustomobject]@{
        kind = $Item.kind
        name = $Item.name
        skills = @(Get-InstalledSkillNames $State.Catalog $Item)
        repository = $Repository
        ref = $Ref
        commit = $State.Commit
    }
    $lock.schemaVersion = 1
    $lock.packages = @($packages | Sort-Object kind, name)
    Write-Lock $lock
}

if ($Action -eq 'doctor') {
    $lock = Read-Lock
    $target = Join-Path (Get-ProjectRoot) '.agents\skills'
    $missing = @(
        foreach ($package in @($lock.packages)) {
            $skillNames = if ($package.skills) { @($package.skills) } elseif ($package.kind -eq 'skill') { @($package.name) } else { @() }
            foreach ($skillName in $skillNames) {
                if (-not (Test-Path -LiteralPath (Join-Path $target $skillName) -PathType Container)) { $skillName }
            }
        }
    )
    if ($missing.Count) { throw "Missing project skills: $($missing -join ', ')" }
    Write-Output "Locked packages: $(@($lock.packages).Count)"
    Write-Output 'Doctor: OK'
    exit 0
}

if ($Action -eq 'update') {
    $lock = Read-Lock
    $packages = @($lock.packages)
    if ($Name) { $packages = @($packages | Where-Object { $_.name -ieq $Name }) }
    if ($packages.Count -eq 0) { throw 'No matching locked packages. Install one with -Action add first.' }
    foreach ($package in $packages) {
        & $PSCommandPath -Action add -Name $package.name -Kind $package.kind -ProjectPath (Get-ProjectRoot) -Ref $package.ref -Repository $package.repository -CacheRoot $CacheRoot
        if ($LASTEXITCODE -ne 0) { throw "Update failed for $($package.kind) $($package.name)." }
    }
    exit 0
}

$state = Get-SourceState
$items = Get-CatalogItems $state.Catalog

if ($Action -eq 'list') {
    $items | Sort-Object kind, name | Format-Table kind, name, block, description -AutoSize
    exit 0
}

if ($Action -eq 'search') {
    if ([string]::IsNullOrWhiteSpace($Query)) { throw 'Use -Query for -Action search.' }
    $escaped = [regex]::Escape($Query.Trim())
    $matches = @($items | Where-Object { "$($_.kind) $($_.name) $($_.description) $($_.block)" -match $escaped })
    if ($matches.Count -eq 0) { throw "No packages match: $Query" }
    $matches | Sort-Object kind, name | Format-Table kind, name, block, description -AutoSize
    exit 0
}

$item = Resolve-CatalogItem $state.Catalog
Install-CatalogItem $state $item
