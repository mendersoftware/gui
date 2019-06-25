#!/bin/sh

set -e -x

# Uses following env variables:
# * GATEWAY_IP - address of the API gateway
# * GATEWAY_PORT - gateway port, defaults to no specified port
# * DEMO [true/false] - switch for demo UI, defaults to false.
# * INTEGRATION_VERSION - version of integration service, to be displayed in UI
# * ANNOUNCEMENT - announcement to display in Hosted Mender UI

HOSTNAME=""

if [ -n "$GATEWAY_IP" ]; then
    HOSTNAME=$GATEWAY_IP
fi 

if [ -n "$GATEWAY_PORT" ]; then
    HOSTNAME=$HOSTNAME':'$GATEWAY_PORT
fi 

ROOT_URL=""
# It is expected that gateway uri is set as 'rootUrl' variable 
if [ ! -z "$HOSTNAME" ]; then
    ROOT_URL="https://$HOSTNAME"
fi

cat >/var/www/mender-gui/env.js <<EOF
  mender_environment = {
    rootUrl: "$ROOT_URL",
    hasMultitenancy: "$HAVE_MULTITENANT",
    hostedAnnouncement: "$ANNOUCEMENT",
    isDemoMode: "$DEMO",
    menderVersion: "$INTEGRATION_VERSION",
    demoArtifactPort: "$DEMO_ARTIFACT_PORT"
  }
EOF

exec httpd -f -p 80 -c /etc/httpd.conf "$@"
