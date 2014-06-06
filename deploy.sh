#!/bin/sh

rsync --recursive --times --perms --delete --progress --exclude nodeico.db/ --exclude node_modules ./ root@nodei.co:/home/nodei.co/
ssh root@nodei.co 'cd /home/nodei.co/; npm install; service nodeico restart'
