@echo off
title Paper Pilots - Game Server
cd /d "%~dp0"
echo Starting Paper Pilots game server...
echo Open http://127.0.0.1:8080/paper_plane_game.html in your browser
echo.
start "" http://127.0.0.1:8080/paper_plane_game.html
python -m http.server 8080 --bind 127.0.0.1
