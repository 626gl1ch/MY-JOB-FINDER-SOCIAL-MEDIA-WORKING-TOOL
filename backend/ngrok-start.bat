@echo off
echo Starting Glitch Broadcast Backend...
start cmd /k "npm run dev"

echo Starting ngrok tunnel on port 8787...
start cmd /k "ngrok http 8787"

echo.
echo Both services started.
echo Check the ngrok terminal for your Forwarding URL (e.g. https://xxxx.ngrok-free.app).
echo Enter that URL in the Glitch Broadcast Mobile App Settings screen.
echo.
pause
