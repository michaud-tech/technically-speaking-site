@echo off
cd /d "%~dp0"
echo Open http://localhost:4176/learn.html in your browser.
echo Keep this window open while previewing.
node preview.cjs
pause
