#!/bin/sh

set -e -x

# Uses following env variables:
# * GATEWAY_IP - address of the API gateway
# * GATEWAY_PORT - gateway port, defaults to no specified port
# * DEMO [true/false] - switch for demo UI, defaults to false.
# * INTEGRATION_VERSION - version of integration service
# * ANNOUNCEMENT - announcement to display in Hosted Mender UI

# main.js path
MAINJS="./main.js" 

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


# _hasMultitenancy switch for Demo UI
if [ "$HAVE_MULTITENANT" == "true" ]; then
   sed -i "s/var _hasMultitenancy.*/var _hasMultitenancy = true;/g" $MAINJS
fi

# version to display in UI
if [ ! -z "$INTEGRATION_VERSION" ]; then
   	sed -i "s/var _MenderVersion.*/var _MenderVersion = '$INTEGRATION_VERSION';/g" $MAINJS
fi

# announcement to display in Hosted Mender UI
if [ ! -z "$ANNOUNCEMENT" ]; then
   	sed -i "s/var _HostedAnnouncement.*/var _HostedAnnouncement = '$ANNOUNCEMENT';/g" $MAINJS
fi

# isDemoMode switch for Demo UI
if [ "$DEMO" == "true" ]; then
   sed -i "s/var isDemoMode.*/var isDemoMode = true;/g" $MAINJS
else
   uglifyjs $MAINJS -c -o $MAINJS
fi



exec httpd -f -p 80 -c /etc/httpd.conf "$@"
