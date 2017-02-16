#!/bin/sh

stop=0

if [[ $1 == "stop" ]]; then
  echo stop
  `ps -Af | grep simu_sapporo_user.js | awk '{print $2}' | xargs kill`
  ps -Af | grep simu_sapporo_user.js | awk '{print $2}'
  exit 0
fi


users=$1
delaytime=$2
url=$3
lantype=$4
cnt=0

saporro_users=()

while [ $cnt -lt $users ]
do
  user=`echo aaa$cnt`
  saporro_users=`echo "$saporro_users $user"`
  cnt=$(($cnt+1))
done

for saporro_user in $saporro_users; do
  sapporo_pid=`meteor-down simu_sapporo_user.js  $saporro_user $url $lantype $delaytime > $saporro_user &`
  pids+=($sapporo_pid)
done 


pids=`ps -Af | grep simu_sapporo_user.js | awk '{print $2}'`
echo $pids

