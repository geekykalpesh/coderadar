# CodeRadar - Chrome Web Store Package Script
$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

$distDir = Join-Path $projectRoot "dist"
$tempDir = Join-Path $distDir "temp_build"
$zipPath = Join-Path $distDir "code-radar-v1.0.0.zip"

Write-Host "Creating dist directory: $distDir" -ForegroundColor Cyan
if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Copying extension files..." -ForegroundColor Cyan

# Files to bundle into the extension zip
$filesToCopy = @(
    "manifest.json",
    "background.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "index.html"
)

foreach ($f in $filesToCopy) {
    $src = Join-Path $projectRoot $f
    if (Test-Path $src) {
        Copy-Item $src -Destination $tempDir -Force
    }
}

# Directories to bundle
$dirsToCopy = @(
    "logo",
    "images"
)

foreach ($d in $dirsToCopy) {
    $srcDir = Join-Path $projectRoot $d
    if (Test-Path $srcDir) {
        Copy-Item $srcDir -Destination $tempDir -Recurse -Force
    }
}

Write-Host "Compressing extension into ZIP: $zipPath" -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Clean up temp build folder
Remove-Item $tempDir -Recurse -Force

$zipSize = (Get-Item $zipPath).Length / 1KB
Write-Host "Build complete! Package created successfully at:" -ForegroundColor Green
Write-Host "$zipPath ($([math]::Round($zipSize, 1)) KB)" -ForegroundColor Yellow
