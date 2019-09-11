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

touch /var/www/mender-gui/dist/version
MENDER_GUI_VERSION=$(cat /var/www/mender-gui/dist/version)

cat >/var/www/mender-gui/dist/env.js <<EOF
  mender_environment = {
    rootUrl: "$ROOT_URL",
    hostedAnnouncement: "$ANNOUCEMENT",
    isDemoMode: "$DEMO",
    features: {
      hasMultitenancy: "$HAVE_MULTITENANT",
      isEnterprise: "$HAVE_ENTERPRISE",
      isHosted: "$MENDER_HOSTED"
    },
    menderVersion: "$INTEGRATION_VERSION",
    menderArtifactVersion: "$MENDER_ARTIFACT_VERSION",
    menderDebPackageVersion: "$MENDER_DEB_PACKAGE_VERSION",
    metaMenderVersion: "$META_MENDER_VERSION",
    services: {
      deploymentsVersion: "$MENDER_DEPLOYMENTS_VERSION",
      deviceauthVersion: "$MENDER_DEVICEAUTH_VERSION",
      guiVersion: "$MENDER_GUI_VERSION",
      inventoryVersion: "$MENDER_INVENTORY_VERSION"
    },
    demoArtifactPort: "$DEMO_ARTIFACT_PORT"
  }
EOF

if [ "$1" = 'nginx' ]; then
  exec nginx -g 'daemon off;'
fi

exec "$@"
