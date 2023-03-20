import { BarChart as BarChartIcon, PieChartOutline as PieChartIcon } from '@mui/icons-material';

import FlagEU from '../../assets/img/flag-eu.svg';
import FlagUS from '../../assets/img/flag-us.svg';

const startingDeviceCount = {
  os: 'for first 50 devices',
  professional: 'for first 250 devices'
};

const oneSecond = 1000;

export const chartTypes = {
  bar: { key: 'bar', Icon: BarChartIcon },
  pie: { key: 'pie', Icon: PieChartIcon }
};
export const emptyChartSelection = { software: '', group: '', chartType: chartTypes.bar.key, attribute: 'artifact_name' };

export const RECEIVED_HOSTED_LINKS = 'RECEIVED_HOSTED_LINKS';
export const SET_ANNOUNCEMENT = 'SET_ANNOUNCEMENT';
export const SET_ENVIRONMENT_DATA = 'SET_ENVIRONMENT_DATA';
export const SET_FEATURES = 'SET_FEATURES';
export const SET_FIRST_LOGIN_AFTER_SIGNUP = 'SET_FIRST_LOGIN_AFTER_SIGNUP';
export const SET_SEARCH_STATE = 'SET_SEARCH_STATE';
export const SET_SNACKBAR = 'SET_SNACKBAR';
export const SET_VERSION_INFORMATION = 'SET_VERSION_INFORMATION';
export const SET_OFFLINE_THRESHOLD = 'SET_OFFLINE_THRESHOLD';
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS';
export const SORTING_OPTIONS = {
  asc: 'asc',
  desc: 'desc'
};
export const BEGINNING_OF_TIME = '2016-01-01T00:00:00.000Z';
export const TIMEOUTS = {
  debounceDefault: 700,
  debounceShort: 300,
  halfASecond: 0.5 * oneSecond,
  oneSecond,
  twoSeconds: 2 * oneSecond,
  threeSeconds: 3 * oneSecond,
  fiveSeconds: 5 * oneSecond,
  refreshDefault: 10 * oneSecond
};
export const locations = {
  eu: { key: 'eu', title: 'EU', location: 'eu.hosted.mender.io', icon: FlagEU },
  us: { key: 'us', title: 'US', location: 'hosted.mender.io', icon: FlagUS }
};
export const PLANS = {
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
};
// the needs names need to be aligned with the name of the features in the appReducer, as they will be checked in the addonselection
export const ADDONS = {
  configure: {
    title: 'Configure',
    description: 'Expand your plan with device configuration features',
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
};
