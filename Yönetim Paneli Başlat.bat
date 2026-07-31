@echo off
title Oyun Yonetim Paneli Sunucusu
cd oyun-admin-panel
echo Yonetim Paneli Baslatiliyor... Lutfen bu pencereyi kapatmayin! Paneli kapatmak istediginizde bu pencereyi kapatabilirsiniz.
start chrome --app=http://localhost:3001
node server.js
