import jwtDecode from 'jwt-decode';
import md5 from 'md5';
import React from 'react';

import store from './reducers';
import appConstants from './constants/appConstants';
import { DEVICE_FILTERING_OPTIONS } from './constants/deviceConstants';

export function isEncoded(uri) {
  uri = uri || '';

  return uri !== decodeURIComponent(uri);
}

export function fullyDecodeURI(uri) {
  while (isEncoded(uri)) {
    uri = decodeURIComponent(uri);
  }

  return uri;
}

const statCollector = (items, statistics) => items.reduce((accu, property) => accu + Number(statistics[property] || 0), 0);

export const groupDeploymentStats = stats => ({
  // don't include 'pending' as inprogress, as all remaining devices will be pending - we don't discriminate based on phase membership
  inprogress: statCollector(['downloading', 'installing', 'rebooting'], stats),
  pending: stats['pending'] || 0,
  successes: statCollector(['success', 'already-installed'], stats),
  failures: statCollector(['failure', 'aborted', 'noartifact', 'decommissioned'], stats)
});

export function statusToPercentage(state, intervals) {
  var time;
  var minutes = intervals / 3;
  switch (state) {
    case 'pending':
    case 'noartifact':
      return 0;

    case 'downloading':
      // increase slightly over time to show progress
      time = minutes < 15 && intervals < 69 ? 0 + intervals : 69;
      return time;

    case 'installing':
      return 70;

    case 'rebooting':
      time = minutes < 18 && 75 + intervals < 99 ? 75 + intervals : 99;
      return time;

    case 'aborted':
    case 'already-installed':
    case 'failure':
    case 'success':
      return 100;
  }
}

export function decodeSessionToken(token) {
  try {
    var decoded = jwtDecode(token);
    return decoded.sub;
  } catch (err) {
    //console.log(err);
    return;
  }
}

export function isEmpty(obj) {
  for (var prop in obj) {
    return false;
  }
  return true;
}

export function preformatWithRequestID(res, failMsg) {
  // ellipsis line
  if (failMsg.length > 100) failMsg = `${failMsg.substring(0, 220)}...`;

  try {
    if (res.body && Object.keys(res.body).includes('request_id')) {
      let shortRequestUUID = res.body['request_id'].substring(0, 8);
      let finalMessage = `${failMsg} [Request ID: ${shortRequestUUID}]`;
      return finalMessage;
    }
  } catch (e) {
    console.log('failed to extract request id:', e);
  }
  return failMsg;
}

export const filtersCompare = (filters, otherFilters) =>
  filters.length !== otherFilters.length ||
  filters.some(filter =>
    otherFilters.find(
      otherFilter => otherFilter.key === filter.key && Object.entries(filter).reduce((accu, [key, value]) => accu || otherFilter[key] !== value, false)
    )
  );

/*
 *
 * Deep compare
 *
 */
export function deepCompare() {
  var i, l, leftChain, rightChain;

  function compare2Objects(x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
      return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if (
      (typeof x === 'function' && typeof y === 'function') ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)
    ) {
      return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }

    if (x.constructor !== y.constructor) {
      return false;
    }

    if (x.prototype !== y.prototype) {
      return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false;
    }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }

      switch (typeof x[p]) {
        case 'object':
        case 'function':
          leftChain.push(x);
          rightChain.push(y);

          if (!compare2Objects(x[p], y[p])) {
            return false;
          }

          leftChain.pop();
          rightChain.pop();
          break;

        default:
          if (x[p] !== y[p]) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {
    leftChain = []; //Todo: this can be cached
    rightChain = [];

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }

  return true;
}

export function stringToBoolean(content) {
  if (!content) {
    return false;
  }
  const string = content + '';
  switch (string.trim().toLowerCase()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(string);
  }
}

export function hashString(str) {
  return md5(str);
}

export const formatTime = date => {
  if (date) {
    return date
      .replace(' ', 'T')
      .replace(/ /g, '')
      .replace('UTC', '');
  }
  return;
};

export function formatPublicKey(key) {
  key = key.replace('-----BEGIN PUBLIC KEY-----', '');
  key = key.replace('-----END PUBLIC KEY-----', '');
  return `${key.substring(0, 15)} ... ${key.substring(key.length - 15)}`;
}

export function intersection(o1, o2) {
  return Object.keys(o1)
    .concat(Object.keys(o2))
    .sort()
    .reduce((r, a, i, aa) => {
      if (i && aa[i - 1] === a) {
        r.push(a);
      }
      return r;
    }, []);
}

export const customSort = (direction, field) => (a, b) => {
  if (a[field] > b[field]) return direction ? -1 : 1;
  if (a[field] < b[field]) return direction ? 1 : -1;
  return 0;
};

export const duplicateFilter = (item, index, array) => array.indexOf(item) == index;

export const unionizeStrings = (someStrings, someOtherStrings) => {
  const startingPoint = new Set(someStrings.filter(item => item.length));
  const uniqueStrings = someOtherStrings.length
    ? someOtherStrings.reduce((accu, item) => {
        if (item.trim().length) {
          accu.add(item.trim());
        }
        return accu;
      }, startingPoint)
    : startingPoint;
  return [...uniqueStrings];
};

export const generateDeploymentGroupDetails = (filter, groupName) =>
  filter && filter.terms
    ? `${groupName} (${filter.terms
        .map(filter => `${filter.attribute || filter.key} ${DEVICE_FILTERING_OPTIONS[filter.type || filter.operator].shortform} ${filter.value}`)
        .join(', ')})`
    : groupName;

export const tryMapDeployments = (accu, id) => {
  if (accu.state.deployments.byId[id]) {
    accu.deployments.push(accu.state.deployments.byId[id]);
  }
  return accu;
};

export const mapAttributesToAggregator = item =>
  Object.keys(item).reduce((accu, item) => {
    accu[item] = [];
    return accu;
  }, {});

export const mapDeviceAttributes = (attributes = []) =>
  attributes.reduce(
    (accu, attribute) => {
      if (!(attribute.value && attribute.name)) {
        return accu;
      }
      return { ...accu, [attribute.name]: attribute.value };
    },
    { device_type: '', artifact_name: '' }
  );

const deriveAttributePopularity = (accu, sourceObject = {}) =>
  Object.keys(sourceObject).reduce((keyAccu, key) => {
    keyAccu[key] = keyAccu[key] + 1 || 1;
    return keyAccu;
  }, accu);

export const deriveAttributesFromDevices = devices => {
  const availableAttributes = devices.reduce(
    (accu, item) => {
      if (!item) {
        return accu;
      }
      // count popularity of attributes to create attribute sort order
      accu.identity_data = deriveAttributePopularity(accu.identity_data, item.identity_data);
      accu.attributes = deriveAttributePopularity(accu.attributes, item.attributes);
      return accu;
    },
    { identity_data: [], attributes: [] }
  );
  // sort in reverse order, to have most common attribute at the top of the select
  const inventoryAttributes = Object.entries(availableAttributes.attributes)
    .sort((a, b) => b[1] - a[1])
    .map(a => a[0]);
  const identityAttributes = Object.entries(availableAttributes.identity_data)
    .sort((a, b) => b[1] - a[1])
    .map(a => a[0]);
  return { identityAttributes, inventoryAttributes };
};

export const getFormattedSize = bytes => {
  const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (!bytes) {
    return '0 Bytes';
  }
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export const FileSize = ({ style, fileSize }) => <div style={style}>{getFormattedSize(fileSize)}</div>;

export const Plan = ({ className, plan }) => <div className={className}>{appConstants.PLANS[plan]}</div>;

export const collectAddressesFrom = devices =>
  devices.reduce((collector, device) => {
    const ips = Object.entries(device.attributes).reduce((accu, [name, value]) => {
      if (name.startsWith('ipv4')) {
        if (Array.isArray(value)) {
          const texts = value.map(text => text.slice(0, text.indexOf('/')));
          accu.push(...texts);
        } else {
          const text = value.slice(0, value.indexOf('/'));
          accu.push(text);
        }
      }
      return accu;
    }, []);
    collector.push(...ips);
    return collector;
  }, []);

export const getDemoDeviceAddress = devices => {
  let targetUrl = '';
  const defaultVitualizedIp = '10.0.2.15';
  const addresses = collectAddressesFrom(devices);
  const address = addresses.reduce((accu, item) => {
    if (accu && item === defaultVitualizedIp) {
      return accu;
    }
    return item;
  }, null);
  const onboarding = store.getState().users.onboarding;
  const onboardingApproach = onboarding.approach;
  const port = onboarding.demoArtifactPort;
  targetUrl = `http://${address}:${port}`;
  if (!address || (onboardingApproach === 'virtual' && (navigator.appVersion.indexOf('Win') != -1 || navigator.appVersion.indexOf('Mac') != -1))) {
    targetUrl = `http://localhost:${port}`;
  }
  return Promise.resolve(targetUrl);
};

export const detectOsIdentifier = () => {
  if (navigator.appVersion.indexOf('Win') != -1) return 'Windows';
  if (navigator.appVersion.indexOf('Mac') != -1) return 'MacOs';
  if (navigator.appVersion.indexOf('X11') != -1) return 'Unix';
  return 'Linux';
};

export const findLocalIpAddress = () => {
  const pc = new RTCPeerConnection({ iceServers: [] });
  const noop = () => {};
  const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
  return new Promise((resolve, reject) => {
    try {
      pc.createDataChannel(''); //create a bogus data channel
      pc.createOffer(sdp => pc.setLocalDescription(sdp, noop, noop), noop); // create offer and set local description
      pc.onicecandidate = ice => {
        //listen for candidate events
        if (ice && ice.candidate) {
          const { address, candidate } = ice.candidate;
          if (address && address.match(ipRegex)) {
            return resolve(address);
          }
          if (candidate && candidate.match(ipRegex)) {
            const matches = candidate.match(ipRegex);
            if (matches.length) {
              return resolve(matches[0]);
            }
          }
        }
      };
    } catch (ex) {
      return reject(Error(ex));
    }
  });
};

export const getRemainderPercent = phases => {
  // use this to get remaining percent of final phase so we don't set a hard number
  let remainder = 100;
  // remove final phase size if set
  phases[phases.length - 1].batch_size = null;
  for (let phase of phases) {
    remainder = phase.batch_size ? remainder - phase.batch_size : remainder;
  }
  return remainder;
};

export const sortDeploymentDevices = devices => {
  const newList = {
    aborted: [],
    decommissioned: [],
    'already-installed': [],
    downloading: [],
    failure: [],
    installing: [],
    noartifact: [],
    pending: [],
    rebooting: [],
    success: []
  };
  devices.map(device => newList[device.status].push(device));
  const newCombine = newList.failure.concat(
    newList.downloading,
    newList.installing,
    newList.rebooting,
    newList.pending,
    newList.success,
    newList.aborted,
    newList.noartifact,
    newList['already-installed'],
    newList.decommissioned
  );
  return newCombine;
};

export const startTimeSort = (a, b) => (b.created > a.created) - (b.created < a.created);

export const standardizePhases = phases =>
  phases.map((phase, index) => {
    let standardizedPhase = { batch_size: phase.batch_size, start_ts: index };
    if (phase.delay) {
      standardizedPhase.delay = phase.delay;
      standardizedPhase.delayUnit = phase.delayUnit || 'hours';
    }
    if (index === 0) {
      // delete the start timestamp from a deployment pattern, to default to starting without delay
      delete standardizedPhase.start_ts;
    }
    return standardizedPhase;
  });

/*
 * Match device attributes against filters, return filtered device list
 */
export const filterDevices = (deviceState, filters, status) => {
  const deviceIds = status ? deviceState.byStatus[status].deviceIds : Object.keys(deviceState.byId);
  return deviceIds.filter(deviceId => {
    const device = deviceState.byId[deviceId];
    return filters.reduce(
      (accu, filter) =>
        accu &&
        !!(
          (device.attributes && device.attributes[filter.key] && device.attributes[filter.key].toString().startsWith(filter.value)) ||
          (device.identity_data && device.identity_data[filter.key] && device.identity_data[filter.key].toString().startsWith(filter.value)) ||
          (device[filter.key] && device[filter.key].toString().startsWith(filter.value))
        ),
      true
    );
  });
};

export const getDebInstallationCode = (
  packageVersion,
  noninteractive = false
) => `wget https://d1b0l86ne08fsf.cloudfront.net/${packageVersion}/dist-packages/debian/armhf/mender-client_${packageVersion}-1_armhf.deb && \\
${noninteractive ? 'DEBIAN_FRONTEND=noninteractive' : 'sudo'} dpkg -i --force-confdef --force-confold mender-client_${packageVersion}-1_armhf.deb`;

export const getDebConfigurationCode = (ipAddress, isHosted, isEnterprise, token, packageVersion, deviceType = 'generic-armv6') => {
  let connectionInstructions = ``;
  let demoSettings = `  --quiet --demo ${ipAddress ? `--server-ip ${ipAddress}` : ''}`;
  if (isEnterprise || isHosted) {
    const enterpriseSettings = `  --tenant-token $TENANT_TOKEN`;
    if (isHosted) {
      connectionInstructions = `  --quiet --hosted-mender \\
${enterpriseSettings} \\
  --retry-poll 30 \\
  --update-poll 5 \\
  --inventory-poll 5`;
    } else {
      connectionInstructions = `${demoSettings} \\
${enterpriseSettings}`;
    }
  } else {
    connectionInstructions = `${demoSettings}`;
  }
  const debInstallationCode = getDebInstallationCode(packageVersion, true);
  let codeToCopy = `sudo bash -c '${debInstallationCode} && \\
DEVICE_TYPE="${deviceType}" && \\${
    token
      ? `
TENANT_TOKEN="${token}" && \\`
      : ''
  }
mender setup \\
  --device-type $DEVICE_TYPE \\
${connectionInstructions} && \\
systemctl restart mender-client'
`;
  return codeToCopy;
};
