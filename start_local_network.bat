@echo off
echo ========================================
echo   Axess Intelligence Local Network Test
echo ========================================
echo.
echo This will start the app on your local network
echo so you can access it from your phone.
echo.
echo Make sure your phone is connected to the same WiFi!
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo Your local IP address is: %LOCAL_IP%
echo.
echo Starting React app on local network...
echo.

REM Start React app with host 0.0.0.0 to allow network access
set HOST=0.0.0.0
set PORT=3000

echo React app will be available at:
echo http://%LOCAL_IP%:3000
echo.
echo Open this URL on your phone to test!
echo.

npm start

pause
