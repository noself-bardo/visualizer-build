@echo off
cd /d "%~dp0"
set "PORT=5174"
set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
start "" http://127.0.0.1:5174
if exist "%NODE_EXE%" (
  echo Starting Visual Systems Analyst at http://127.0.0.1:5174
  "%NODE_EXE%" server.js
) else (
  echo Starting Visual Systems Analyst at http://127.0.0.1:5174
  node server.js
)
echo.
echo Server stopped. If there was an error above, send a screenshot.
pause
