#!/bin/sh

stop=0

if [[ $1 == "stop" ]]; then
  echo stop
  `ps -Af | grep simu_sapporo_user.js | awk '{print $2}' | xargs kill`
  ps -Af | grep simu_sapporo_user.js | awk '{print $2}'
  exit 0
fi


users=$1
url=$2
lantype=$3
delaytime=$4
cnt=0

saporro_users=()

echo "$users"

while [ $cnt -lt $users ]
do
  user=`echo aaa$cnt`
  saporro_users=`echo "$saporro_users $user"`
  cnt=$(($cnt+1))
done

for saporro_user in $saporro_users; do
  echo "create $saporro_user"
  sapporo_pid=`meteor-down simu_sapporo_user.js  $saporro_user $url $lantype $delaytime > /dev/null 2>&1  &`
  pids+=($sapporo_pid)
done 


pids=`ps -Af | grep simu_sapporo_user.js | awk '{print $2}'`
echo $pids

