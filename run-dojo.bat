@echo off
title Dojo local server
REM Double-click to run Dojo locally. Leave this window open while using the app.
REM Works from inside the "app" folder or from the folder that contains it.
cd /d "%~dp0"

set "PORT=4010"
set "ROOT=."
if exist "app\index.html" set "ROOT=app"
if not exist "%ROOT%\index.html" (
  echo Could not find index.html here or in an "app" folder.
  echo Put this .bat next to index.html, or next to the "app" folder.
  echo Current folder: %CD%
  pause & goto :eof
)
if not exist "%ROOT%\js\lib\dojo-components.js" (
  echo Found index.html but js\lib\dojo-components.js is missing.
  echo Re-download the full Dojo app folder.
  pause & goto :eof
)

REM --- Find a Python: PATH first, then common Anaconda/Miniconda locations ---
REM (double-clicking uses plain cmd, where conda's PATH is usually NOT active,
REM  so we look for python.exe directly.)
set "PY="
for %%P in (
  "python.exe"
  "py.exe"
  "%USERPROFILE%\anaconda3\python.exe"
  "%USERPROFILE%\miniconda3\python.exe"
  "%USERPROFILE%\AppData\Local\anaconda3\python.exe"
  "%USERPROFILE%\AppData\Local\miniconda3\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
  "C:\ProgramData\anaconda3\python.exe"
  "C:\ProgramData\miniconda3\python.exe"
) do (
  if not defined PY (
    "%%~P" -c "import sys" >nul 2>nul && set "PY=%%~P"
  )
)

if not defined PY (
  echo.
  echo Could not find Python automatically.
  echo Open "Anaconda Prompt", cd to this folder, and run:
  echo     python -m http.server %PORT% --directory "%ROOT%"
  echo Then open http://localhost:%PORT%/
  echo.
  pause & goto :eof
)

echo.
echo   Dojo - local server
echo   Python:  %PY%
echo   Serving: %ROOT%    Open: http://localhost:%PORT%/
echo   Needs internet for React and the Barlow fonts (loaded from CDN).
echo   (Close this window to stop.)
echo.

start "" "http://localhost:%PORT%/"
"%PY%" -m http.server %PORT% --directory "%ROOT%"

echo.
echo Server stopped.
pause
