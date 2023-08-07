// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import { BarChart as BarChartIcon, PieChartOutline as PieChartIcon } from '@mui/icons-material';

import FlagEU from '../../assets/img/flag-eu.svg';
import FlagUS from '../../assets/img/flag-us.svg';

const startingDeviceCount = {
  os: 'for first 50 devices',
  professional: 'for first 250 devices'
};

export const chartTypes = {
  bar: { key: 'bar', Icon: BarChartIcon },
  pie: { key: 'pie', Icon: PieChartIcon }
};
export const emptyChartSelection = { software: '', group: '', chartType: chartTypes.bar.key, attribute: 'artifact_name' };

export const BEGINNING_OF_TIME = '2016-01-01T00:00:00.000Z';

export const locations = {
  eu: { key: 'eu', title: 'EU', location: 'eu.hosted.mender.io', icon: FlagEU },
  us: { key: 'us', title: 'US', location: 'hosted.mender.io', icon: FlagUS }
};
export const PLANS = {
  os: {
    name: 'Basic',
    offer: true,
    price: '$32/month',
    deviceCount: startingDeviceCount.os,
    offerprice: '$23/month for first 50 devices',
    price2: 'for first 6 months;\n$29/month thereafter',
    features: ['Basic OTA features'],
    value: 'os'
  },
  professional: {
    name: 'Professional',
    offer: true,
    price: '$269/month',
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
      price: '$11/month',
      deviceCount: startingDeviceCount.os
    },
    professional: {
      price: '$65/month',
      deviceCount: startingDeviceCount.professional
    },
    eligible: ['os', 'professional', 'enterprise']
  },
  troubleshoot: {
    title: 'Troubleshoot',
    description: 'Expand your plan with device troubleshooting features',
    needs: ['hasDeviceConnect'],
    os: {
      price: '$27/month',
      deviceCount: startingDeviceCount.os
    },
    professional: {
      price: '$72/month',
      deviceCount: startingDeviceCount.professional
    },
    eligible: ['os', 'professional', 'enterprise']
  },
  monitor: {
    title: 'Monitor',
    description: 'Expand your plan with device monitoring features',
    needs: ['hasMonitor'],
    os: {
      price: '-',
      deviceCount: '-'
    },
    professional: {
      price: '$86/month',
      deviceCount: startingDeviceCount.professional
    },
    eligible: ['professional', 'enterprise']
  }
};

export const DARK_MODE = 'dark';
export const LIGHT_MODE = 'light';
