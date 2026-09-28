@echo off
cd /d "%~dp0"
echo Drapit - theme-extensie deployen naar de GEPUBLICEERDE App Store-app (shopify.app.toml)...
echo Even geduld, dit duurt 1-2 minuten. De uitvoer komt hieronder en in deploy-log-appstore.txt.
echo.
call shopify app deploy --config shopify.app.appstore.toml --force > deploy-log-appstore.txt 2>&1
type deploy-log-appstore.txt
echo.
echo Klaar. Sluit dit venster en open de thema-editor opnieuw.
pause
