#!/bin/sh

rsync --recursive --times --perms --delete --progress --exclude nodeico.db/ --exclude node_modules ./ nodei.co:nodei.co/
ssh nodei.co svcadm restart nodeico
