@echo off
echo Packaging Paper Pilots for distribution...
echo.

cd /d "%~dp0"

:: Create a clean package directory
if exist "package" rmdir /S /Q "package"
mkdir "package"

:: Copy game files
copy /Y "paper_plane_game.html" "package\" >nul
copy /Y "index.html" "package\" >nul
copy /Y "vercel.json" "package\" >nul

:: Copy assets
xcopy /E /I /Y "assets" "package\assets" >nul

:: Copy music and SFX
copy /Y "*.mp3" "package\" >nul

:: Remove dev-only files
if exist "package\docs" rmdir /S /Q "package\docs"
if exist "package\package" rmdir /S /Q "package\package"
if exist "package\start-server.bat" del /Q "package\start-server.bat"
if exist "package\README-DEVELOPER.md" del /Q "package\README-DEVELOPER.md"
if exist "package\asset-sheet.html" del /Q "package\asset-sheet.html"
if exist "package\paper-pilots-gamedev" rmdir /S /Q "package\paper-pilots-gamedev"

:: Create ZIP using tar (built into Windows 10+)
echo Creating ZIP archive...
tar -a -c -f "PaperPilots.zip" -C "package" .

:: Clean up
rmdir /S /Q "package"

echo.
echo Done! Created PaperPilots.zip
echo Players: extract the ZIP and open index.html in a browser.
echo.
pause
