#!/bin/sh

url=$1
lantype=$2

saporro_users='aaa bbb ccc ddd eee fff ggg'

for saporro_user in $saporro_users; do
  sapporo_pid=`meteor-down simu_sapporo_user.js  $saporro_user $url $lantype > $saporro_user &`
  pids+=($sapporo_pid)
done 


pids=`ps -Af | grep simu_sapporo_user.js | awk '{print $2}'`
echo $pids

