#!/bin/sh

set -e -x

# Uses following env variables:
# * GATEWAY_IP - address of the API gateway
# * GATEWAY_PORT - gateway port, defaults to no specified port
# * DEMO [true/false] - switch for demo UI, defaults to false. 

# main.js path
MAINJS="./js/main.js" 

HOSTNAME=""

if [ -n "$GATEWAY_IP" ]; then
    HOSTNAME=$GATEWAY_IP
fi 

if [ -n "$GATEWAY_PORT" ]; then
    HOSTNAME=$HOSTNAME':'$GATEWAY_PORT
fi 

# It is expected that gateway uri is set as 'rootUrl' variable 
if [ ! -z "$HOSTNAME" ]; then
    sed -i "s/var rootUrl.*/var rootUrl = 'https:\/\/$HOSTNAME';/g" $MAINJS
else
    sed -i "s/var rootUrl.*/var rootUrl = '';/g" $MAINJS
fi

# isDemoMode switch for Demo UI
if [ "$DEMO" == "true" ]; then
   sed -i "s/var isDemoMode.*/var isDemoMode = true;/g" $MAINJS
fi

uglifyjs $MAINJS -c -o $MAINJS
exec httpd -f -p 80 -c /etc/httpd.conf "$@"
