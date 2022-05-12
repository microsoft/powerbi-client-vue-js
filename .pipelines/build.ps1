$exitCode = 0;

Write-Host "start: List all files"
& cd .\vue
& dir
Write-Host "end: List all files"

# Build the package
Write-Host "start: npm run build"
& npm run build
Write-Host "done: npm run build"

$exitCode += $LASTEXITCODE;

if ($exitCode -ne 0) {
  Write-Host "Failed to run: npm run build"
  exit $exitCode
}

# Check linting
Write-Host "start: npm run lint"
& npm run lint
Write-Host "done: npm run lint"

$exitCode += $LASTEXITCODE;

if ($exitCode -ne 0) {
  Write-Host "Failed to run: npm run lint"
  exit $exitCode
}

# Get contents of dist folder
Write-Host "start: Get dist folder files"
& dir "dist"
Write-Host "Done: Get dist folder files"

exit $exitCode