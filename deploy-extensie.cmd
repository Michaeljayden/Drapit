@echo off
cd /d "%~dp0"
echo Drapit - theme-extensie deployen naar Shopify...
echo Even geduld, dit duurt 1-2 minuten. De uitvoer komt hieronder en in deploy-log.txt.
echo.
call shopify app deploy --force > deploy-log.txt 2>&1
type deploy-log.txt
echo.
echo Klaar. Sluit dit venster en open de thema-editor opnieuw.
pause
