# PowerShell script to remove all .user-card:hover CSS rules
$cssFile = "c:\Users\jadav\Engineer_connect\engineer_connect-app\src\App.css"
$content = Get-Content $cssFile -Raw

# Remove all .user-card:hover rules and their content blocks
# This regex will match .user-card:hover followed by optional spaces, selectors, and the entire CSS block
$content = $content -replace '\.user-card:hover[^}]*\{[^}]*\}', ''

# Also remove any empty lines that might be left behind
$content = $content -replace '\n\s*\n\s*\n', "`n`n"

# Write the cleaned content back to the file
Set-Content -Path $cssFile -Value $content -NoNewline

Write-Host "Removed all .user-card:hover CSS rules from App.css"
