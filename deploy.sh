#!/bin/sh

host=nodei.co

rsync --recursive --times --perms --delete --progress --exclude nodeico.db/ --exclude node_modules --exclude logs ./ nodeico@${host}:/home/nodeico/web/
ssh nodeico@${host} 'mkdir -p /home/nodeico/web/log && cd /home/nodeico/web && npm install'
ssh root@${host} 'service nodeico-1 restart && service nodeico-2 restart'
