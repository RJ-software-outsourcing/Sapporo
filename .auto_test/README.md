simu_sapporo_user.js is a script which is based on meteor-down to simulate user using Sapporo.

For multiple users, you can use simu_helper.sh to create them at once.
Each user's log will be in aaa<user number>

Lang ID is a ID in Sapporo DB for program language item.
cmd Example
*                    simu_helper.sh \<user number\> \<url\> \<time\> \<c lang ID\> \<python 2 lang ID\>
*                    simu_helper.sh stop // Stop All meteor.
*   meteor-down simu_sapporo_user.js <user> <url> [-t <delay time> -lc <c ID> -lp2 <python2 ID> -lj <java ID>]
    Ex:
      meteor-down simu_sapporo_user.js aaa http://localhost:4000 -t 3000 -lc KELLL581KSCxxPP -lp2 iK59adkaokwa -lj sefjislIKJLLL


