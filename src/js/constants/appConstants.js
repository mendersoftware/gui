const startingDeviceCount = {
  os: 'for first 50 devices',
  professional: 'for first 250 devices'
};

const apiRoot = '/api/management';
const apiUrl = {
  v1: `${apiRoot}/v1`,
  v2: `${apiRoot}/v2`
};

module.exports = {
  RECEIVED_HOSTED_LINKS: 'RECEIVED_HOSTED_LINKS',
  SET_ANNOUNCEMENT: 'SET_ANNOUNCEMENT',
  SET_FIRST_LOGIN_AFTER_SIGNUP: 'SET_FIRST_LOGIN_AFTER_SIGNUP',
  SET_SNACKBAR: 'SET_SNACKBAR',
  SET_VERSION_INFORMATION: 'SET_VERSION_INFORMATION',
  SET_YESTERDAY: 'SET_YESTERDAY',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  SORTING_OPTIONS: {
    asc: 'asc',
    desc: 'desc'
  },
  BEGINNING_OF_TIME: '2016-01-01T00:00:00.000Z',
  PLANS: {
    os: {
      name: 'Basic',
      offer: true,
      price: '$29/month',
      deviceCount: startingDeviceCount.os,
      offerprice: '$23/month for first 50 devices',
      price2: 'for first 6 months;\n$29/month thereafter',
      features: ['Basic OTA features'],
      value: 'os'
    },
    professional: {
      name: 'Professional',
      offer: true,
      price: '$249/month',
      deviceCount: startingDeviceCount.professional,
      offerprice: '$200/month for first 50 devices',
      price2: 'for first 6 months;\n$249/month thereafter',
      features: ['+ Advanced OTA features', '+ Standard support'],
      value: 'professional'
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom pricing',
      deviceCount: 'unlimited devices',
      features: ['+ Enterprise-grade OTA features', '+ Premium support'],
      value: 'enterprise'
    }
  },
  // the needs names need to be aligned with the name of the features in the appReducer, as they will be checked in the addonselection
  ADDONS: {
    configure: {
      title: 'Configure',
      description: 'Expand your plan with device configuration features',
      link: 'https://mender.io/plans/features',
      needs: ['hasDeviceConfig'],
      os: {
        price: '$10/month',
        deviceCount: startingDeviceCount.os
      },
      professional: {
        price: '$60/month',
        deviceCount: startingDeviceCount.professional
      }
    },
    troubleshoot: {
      title: 'Troubleshoot',
      description: 'Expand your plan with device troubleshooting features',
      link: 'https://mender.io/plans/features',
      needs: ['hasDeviceConnect'],
      os: {
        price: '$24/month',
        deviceCount: startingDeviceCount.os
      },
      professional: {
        price: '$67/month',
        deviceCount: startingDeviceCount.professional
      }
    },
    monitor: {
      title: 'Monitor',
      description: 'Expand your plan with device monitoring features',
      link: 'https://mender.io/plans/features/monitoring',
      needs: ['hasMonitor'],
      os: {
        price: '$24/month',
        deviceCount: startingDeviceCount.os
      },
      professional: {
        price: '$67/month',
        deviceCount: startingDeviceCount.professional
      }
    }
  },
  apiRoot,
  apiUrl
};
