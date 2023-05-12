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

wget -O /var/www/mender-gui/dist/tags.json https://api.github.com/repos/mendersoftware/gui/tags?per_page=10
cat >/var/www/mender-gui/dist/env.js <<EOF
  mender_environment = {
    hostAddress: "$HOSTNAME",
    hostedAnnouncement: "$ANNOUNCEMENT",
    isDemoMode: "$DEMO",
    features: {
      hasAddons: "$HAVE_ADDONS",
      hasAuditlogs: "$HAVE_AUDITLOGS",
      hasDeviceConfig: "$HAVE_DEVICECONFIG",
      hasDeviceConnect: "$HAVE_DEVICECONNECT",
      hasDeltaProgress: "$HAVE_DELTA_PROGRESS",
      hasMonitor: "$HAVE_MONITOR",
      hasMultitenancy: "$HAVE_MULTITENANT",
      hasReleaseTags: "$HAVE_RELEASE_TAGS",
      hasReporting: "$HAVE_REPORTING",
      isEnterprise: "$HAVE_ENTERPRISE",
      isHosted: "$MENDER_HOSTED"
    },
    trackerCode: "$TRACKER_CODE",
    recaptchaSiteKey: "$RECAPTCHA_SITE_KEY",
    stripeAPIKey: "$STRIPE_API_KEY",
    integrationVersion: "$INTEGRATION_VERSION",
    menderVersion: "$MENDER_VERSION",
    menderArtifactVersion: "$MENDER_ARTIFACT_VERSION",
    metaMenderVersion: "$META_MENDER_VERSION",
    services: {
      deploymentsVersion: "$MENDER_DEPLOYMENTS_VERSION",
      deviceauthVersion: "$MENDER_DEVICEAUTH_VERSION",
      guiVersion: "$GIT_COMMIT_TAG",
      inventoryVersion: "$MENDER_INVENTORY_VERSION"
    },
    demoArtifactPort: "$DEMO_ARTIFACT_PORT",
    disableOnboarding: "$DISABLE_ONBOARDING"
  }
EOF

if [ "$1" = 'nginx' ]; then
  exec nginx -g 'daemon off;'
fi

exec "$@"
