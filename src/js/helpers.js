import React from 'react';
import jwtDecode from 'jwt-decode';
import md5 from 'md5';
import pluralize from 'pluralize';

import { DEVICE_FILTERING_OPTIONS } from './constants/deviceConstants';
import { initialState as onboardingReducerState } from './reducers/onboardingReducer';

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

export const groupDeploymentStats = deployment => {
  const stats = deployment.stats || {};
  // don't include 'pending' as inprogress, as all remaining devices will be pending - we don't discriminate based on phase membership
  const inprogress = statCollector(['downloading', 'installing', 'rebooting'], stats);
  const pending = (deployment.max_devices ? deployment.max_devices - deployment.device_count : 0) + (stats['pending'] || 0);
  const successes = statCollector(['success', 'already-installed', 'noartifact'], stats);
  const failures = statCollector(['failure', 'aborted', 'decommissioned'], stats);
  return {
    inprogress: inprogress,
    pending: pending,
    successes: successes,
    failures: failures
  };
};

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

export const isEmpty = obj => {
  for (const _ in obj) {
    return false;
  }
  return true;
};

export const extractErrorMessage = (err, fallback = '') =>
  err.response?.data?.error?.message || err.response?.data?.error || err.error || err.message || fallback;

export function preformatWithRequestID(res, failMsg) {
  // ellipsis line
  if (failMsg.length > 100) failMsg = `${failMsg.substring(0, 220)}...`;

  try {
    if (res.data && Object.keys(res.data).includes('request_id')) {
      let shortRequestUUID = res.data['request_id'].substring(0, 8);
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
  if (date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date)) {
    return date.toISOString().slice(0, -1);
  } else if (date) {
    return date.replace(' ', 'T').replace(/ /g, '').replace('UTC', '');
  }
  return;
};

export function formatPublicKey(key) {
  key = key.replace('-----BEGIN PUBLIC KEY-----', '');
  key = key.replace('-----END PUBLIC KEY-----', '');
  return `${key.substring(0, 15)} ... ${key.substring(key.length - 15)}`;
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

export const mapDeviceAttributes = (attributes = []) =>
  attributes.reduce(
    (accu, attribute) => {
      if (!(attribute.value && attribute.name)) {
        return accu;
      }
      accu[attribute.scope || 'inventory'] = {
        ...accu[attribute.scope || 'inventory'],
        [attribute.name]: attribute.value
      };
      return accu;
    },
    { inventory: { device_type: '', artifact_name: '' }, identity: {}, system: {} }
  );

export const getFormattedSize = bytes => {
  const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (!bytes) {
    return '0 Bytes';
  }
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export const FileSize = ({ style, fileSize }) => <div style={style}>{getFormattedSize(fileSize)}</div>;

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

export const getDemoDeviceAddress = (devices, onboardingApproach, port) => {
  let targetUrl = '';
  const defaultVitualizedIp = '10.0.2.15';
  const addresses = collectAddressesFrom(devices);
  const address = addresses.reduce((accu, item) => {
    if (accu && item === defaultVitualizedIp) {
      return accu;
    }
    return item;
  }, null);
  targetUrl = `http://${address}:${port}`;
  if (!address || (onboardingApproach === 'virtual' && (navigator.appVersion.indexOf('Win') != -1 || navigator.appVersion.indexOf('Mac') != -1))) {
    targetUrl = `http://localhost:${port}`;
  }
  return targetUrl;
};

export const detectOsIdentifier = () => {
  if (navigator.appVersion.indexOf('Win') != -1) return 'Windows';
  if (navigator.appVersion.indexOf('Mac') != -1) return 'MacOs';
  if (navigator.appVersion.indexOf('X11') != -1) return 'Unix';
  return 'Linux';
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

export const getPhaseDeviceCount = (numberDevices = 1, batchSize, remainder, isLastPhase) =>
  isLastPhase ? Math.ceil((numberDevices / 100) * (batchSize || remainder)) : Math.floor((numberDevices / 100) * (batchSize || remainder));

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
  devices.map(device => (newList.hasOwnProperty(device.status) ? newList[device.status].push(device) : newList.decommissioned.push(device)));
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

export const getDebInstallationCode = () => `wget -q -O- https://get.mender.io/ | sudo bash -s -- -c experimental`;

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
  const debInstallationCode = getDebInstallationCode();
  let codeToCopy = `${debInstallationCode} && \\
sudo bash -c 'DEVICE_TYPE="${deviceType}" && \\${
    token
      ? `
TENANT_TOKEN="${token}" && \\`
      : ''
  }
mender setup \\
  --device-type $DEVICE_TYPE \\
${connectionInstructions} && \\
systemctl restart mender-client && \\
(cat > /etc/mender/mender-shell.conf << EOF
{
  "ServerURL": "${document.location.origin}",
  "User": "pi"
}
EOF
) && systemctl restart mender-shell'
`;
  return codeToCopy;
};

export const getSnackbarMessage = (skipped, done) => {
  pluralize.addIrregularRule('its', 'their');
  const skipText = skipped
    ? `${skipped} ${pluralize('devices', skipped)} ${pluralize('have', skipped)} more than one pending authset. Expand ${pluralize(
        'this',
        skipped
      )} ${pluralize('device', skipped)} to individually adjust ${pluralize('their', skipped)} authorization status. `
    : '';
  const doneText = done ? `${done} ${pluralize('device', done)} ${pluralize('was', done)} updated successfully. ` : '';
  return `${doneText}${skipText}`;
};

export const extractSoftware = (capabilities = {}) =>
  Object.keys(capabilities).reduce((accu, item) => {
    if (item.endsWith('.version')) {
      accu.push(item.substring(0, item.indexOf('.')));
    }
    return accu;
  }, []);

export const extractSoftwareInformation = (capabilities = {}, softwareTitleMap = {}, softwareHeaderList = []) => {
  const mapLayerInformation = (key, value, i) => {
    let primary = key;
    let secondary = value;
    let priority = i + Object.keys(softwareTitleMap);
    let result = [];
    const infoItems = key.split('.');
    if (infoItems.length === 2) {
      primary = softwareTitleMap[key] ? softwareTitleMap[key].title : primary;
      priority = softwareTitleMap[key] ? softwareTitleMap[key].priority : i;
      result.push({ priority, primary, secondary });
    } else if (infoItems.length >= 3) {
      primary = softwareTitleMap[key] ? softwareTitleMap[key].title : infoItems[1];
      // this is required with the "secondary" assignment in the softwareHeaderList.map to support keys with more than 2 dots
      const punctuated = infoItems.length > softwareHeaderList.length ? infoItems.slice(1, infoItems.length - 1).join('.') : null;
      const things = softwareHeaderList.length
        ? softwareHeaderList.map((item, index) => ({
            priority: index,
            primary: item,
            secondary: infoItems[index] === 'version' && index === infoItems.length - 1 ? value : punctuated ?? infoItems[index]
          }))
        : [{ priority, primary, secondary }];
      result.push(...things);
    } else {
      result.push({ priority, primary, secondary });
    }
    return result;
  };

  const softwareInformation = extractSoftware(capabilities);
  const softwareLayers = Object.entries(capabilities).reduce((accu, item, index) => {
    const softwareAttribute = softwareInformation.find(info => item[0].startsWith(info));
    if (softwareAttribute) {
      if (!accu[softwareAttribute]) {
        accu[softwareAttribute] = [];
      }
      accu[softwareAttribute].push(...mapLayerInformation(item[0], item[1], index));
    }
    return accu;
  }, {});

  return Object.entries(softwareLayers).reduce((accu, item) => {
    accu[item[0]] = item[1].sort((a, b) => a.priority - b.priority);
    return accu;
  }, {});
};
export const getDemoDeviceCreationCommand = token =>
  token
    ? `TENANT_TOKEN='${token}'\ndocker run -it -p ${onboardingReducerState.demoArtifactPort}:${
        onboardingReducerState.demoArtifactPort
      } -e SERVER_URL='https://${window.location.hostname || 'hosted.mender.io'}' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest`
    : './demo --client up';
