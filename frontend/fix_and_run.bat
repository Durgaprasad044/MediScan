@echo off
echo Stopping any running node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning up legacy files...
if exist src\App.jsx del src\App.jsx
if exist src\main.jsx del src\main.jsx
if exist vite.config.js del vite.config.js
if exist index.html del index.html

echo Cleaning Next.js cache...
if exist .next rmdir /s /q .next

echo Installing dependencies...
call npm install

echo Starting Frontend...
npm run dev
