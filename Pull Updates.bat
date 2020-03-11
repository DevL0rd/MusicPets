@echo off
mode con: cols=60 lines=8
title Updating MusicPets...
echo Checking for updates to MusicPets...
git pull
title Update complete!
PING -n 5 127.0.0.1>nul
exit