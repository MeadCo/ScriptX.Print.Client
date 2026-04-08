# merge-dependabot.ps1
# Requires Git + GitHub CLI (gh)
#
# for gh : winget install --id GitHub.cli
# gh auth login required.
#
# Use: npm run merge:dependabot

$ErrorActionPreference = "Stop"

Write-Host "Refreshing main..."
git checkout main
git pull origin main

Write-Host "Recreating TestPRs..."
git checkout -B TestPRs

Write-Host "Fetching Dependabot PRs..."
$prs = gh pr list --author dependabot --state open --json number | ConvertFrom-Json

if ($prs.Count -eq 0) {
    Write-Host "No Dependabot PRs found."
    exit 0
}

foreach ($pr in $prs) {
    $prNumber = $pr.number
    Write-Host "Processing PR #$prNumber"

    $branch = gh pr view $prNumber --json headRefName | ConvertFrom-Json | Select-Object -ExpandProperty headRefName

    Write-Host "Fetching branch $branch"
    git fetch origin $branch

    Write-Host "Merging $branch"
    git merge --no-edit "origin/$branch"
}

Write-Host "Pushing TestPRs..."
git push -u origin TestPRs --force

Write-Host "Done. CI will now run on TestPRs."
