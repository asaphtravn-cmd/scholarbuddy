@echo off
:chay
ngrok http --domain=unfair-motivator-galleria.ngrok-free.dev 3000
echo Tunnel bi dung, se chay lai sau 5 giay...
timeout /t 5 >nul
goto chay