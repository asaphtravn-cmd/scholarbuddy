@echo off
cd /d G:\src\hocbong-web\hocbong
set ADMIN_PASSWORD=admin123456
:chay
node server.js
echo Web bi dung, se chay lai sau 5 giay...
timeout /t 5 >nul
goto chay