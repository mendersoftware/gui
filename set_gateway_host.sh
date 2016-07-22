#!/bin/sh

# Param: expects path to main.js file

# Expects following env variables:
# * GATEWAY_IP - defaults to: localhost
# * GATEWAY_PORT - gateway port, defaults to no specified port

HOSTNAME=localhost

if [ -n "$GATEWAY_IP" ]; then
    HOSTNAME=$GATEWAY_IP
fi 

if [ -n "$GATEWAY_PORT" ]; then
    HOSTNAME=$HOSTNAME':'$GATEWAY_PORT
fi 

# It is expected that gateway uri is set as 'rootUrl' variable 
sed -i "s/var rootUrl.*/var rootUrl = 'https:\/\/$HOSTNAME'/g" $1
