import React from 'react';
import jwtDecode from 'jwt-decode';
import md5 from 'md5';
import pluralize from 'pluralize';
import { getToken } from './auth';

import { DEVICE_FILTERING_OPTIONS } from './constants/deviceConstants';
import {
  DEPLOYMENT_STATES,
  defaultStats,
  deploymentDisplayStates,
  deploymentStatesToSubstates,
  deploymentStatesToSubstatesWithSkipped
} from './constants/deploymentConstants';
import { initialState as onboardingReducerState } from './reducers/onboardingReducer';

const isEncoded = uri => {
  uri = uri || '';
  return uri !== decodeURIComponent(uri);
};

export const fullyDecodeURI = uri => {
  while (isEncoded(uri)) {
    uri = decodeURIComponent(uri);
  }
  return uri;
};

export const groupDeploymentDevicesStats = deployment => {
  const deviceStatCollector = (deploymentStates, devices) =>
    Object.values(devices).reduce((accu, device) => (deploymentStates.includes(device.status) ? accu + 1 : accu), 0);

  const inprogress = deviceStatCollector(deploymentStatesToSubstates.inprogress, deployment.devices);
  const pending = deviceStatCollector(deploymentStatesToSubstates.pending, deployment.devices);
  const successes = deviceStatCollector(deploymentStatesToSubstates.successes, deployment.devices);
  const failures = deviceStatCollector(deploymentStatesToSubstates.failures, deployment.devices);
  const paused = deviceStatCollector(deploymentStatesToSubstates.paused, deployment.devices);
  return { inprogress, paused, pending, successes, failures };
};

export const statCollector = (items, statistics) => items.reduce((accu, property) => accu + Number(statistics[property] || 0), 0);
export const groupDeploymentStats = (deployment, withSkipped) => {
  const stats = { ...defaultStats, ...deployment.stats };
  let groupStates = deploymentStatesToSubstates;
  let result = {};
  if (withSkipped) {
    groupStates = deploymentStatesToSubstatesWithSkipped;
    result.skipped = statCollector(groupStates.skipped, stats);
  }
  result = {
    ...result,
    // don't include 'pending' as inprogress, as all remaining devices will be pending - we don't discriminate based on phase membership
    inprogress: statCollector(groupStates.inprogress, stats),
    pending: (deployment.max_devices ? deployment.max_devices - deployment.device_count : 0) + statCollector(groupStates.pending, stats),
    successes: statCollector(groupStates.successes, stats),
    failures: statCollector(groupStates.failures, stats),
    paused: statCollector(groupStates.paused, stats)
  };
  return result;
};

export const getDeploymentState = deployment => {
  const { status: deploymentStatus = DEPLOYMENT_STATES.pending } = deployment;
  const { inprogress: currentProgressCount, paused } = groupDeploymentStats(deployment);

  let status = deploymentDisplayStates[deploymentStatus];
  if (deploymentStatus === DEPLOYMENT_STATES.pending && currentProgressCount === 0) {
    status = 'queued';
  } else if (paused > 0) {
    status = deploymentDisplayStates.paused;
  }
  return status;
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

    case 'pause_before_installing':
    case 'installing':
      return 70;

    case 'pause_before_committing':
    case 'pause_before_rebooting':
    case 'rebooting':
      time = minutes < 18 && 75 + intervals < 99 ? 75 + intervals : 99;
      return time;

    case 'aborted':
    case 'already-installed':
    case 'failure':
    case 'success':
      return 100;
    default:
      return 0;
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
    if (res?.data && Object.keys(res.data).includes('request_id')) {
      let shortRequestUUID = res.data['request_id'].substring(0, 8);
      return `${failMsg} [Request ID: ${shortRequestUUID}]`;
    }
  } catch (e) {
    console.log('failed to extract request id:', e);
  }
  return failMsg;
}

export const versionCompare = (v1, v2) => {
  const partsV1 = `${v1}`.split('.');
  const partsV2 = `${v2}`.split('.');
  for (let index = 0; index < partsV1.length; index++) {
    const numberV1 = partsV1[index];
    const numberV2 = partsV2[index];
    if (numberV1 > numberV2) {
      return 1;
    }
    if (numberV2 > numberV1) {
      return -1;
    }
  }
  return 0;
};

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
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p) || typeof y[p] !== typeof x[p]) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p) || typeof y[p] !== typeof x[p]) {
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
};

export const customSort = (direction, field) => (a, b) => {
  if (typeof a[field] === 'string') {
    const result = a[field].localeCompare(b[field], { sensitivity: 'case' });
    return direction ? result * -1 : result;
  }
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
  filter && filter.terms?.length
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
      if (attribute.name === 'device_type' && attribute.scope === 'inventory') {
        accu.inventory.device_type = [].concat(attribute.value);
      }
      return accu;
    },
    { inventory: { device_type: [], artifact_name: '' }, identity: {}, monitor: {}, system: {}, tags: {} }
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

const collectAddressesFrom = devices =>
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

export const validatePhases = (phases, deploymentDeviceCount, hasFilter) => {
  if (!phases) {
    return true;
  }
  const remainder = getRemainderPercent(phases);
  return phases.reduce((accu, phase) => {
    if (!accu) {
      return accu;
    }
    const deviceCount = Math.floor((deploymentDeviceCount / 100) * (phase.batch_size || remainder));
    return deviceCount >= 1 || hasFilter;
  }, true);
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
    success: [],
    pause_before_committing: [],
    pause_before_installing: [],
    pause_before_rebooting: []
  };
  devices.map(device => (newList.hasOwnProperty(device.status) ? newList[device.status].push(device) : newList.decommissioned.push(device)));
  return newList.failure.concat(
    newList.pause_before_committing,
    newList.pause_before_installing,
    newList.pause_before_rebooting,
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

export const getDebConfigurationCode = (ipAddress, isHosted, isEnterprise, tenantToken, deviceType = 'generic-armv6', isPreRelease) => {
  let installScriptArgs = `--demo`;
  if (isPreRelease) {
    installScriptArgs = `${installScriptArgs} -c experimental`;
  }
  if (isHosted) {
    const jwtToken = getToken();
    installScriptArgs = `${installScriptArgs} --commercial --jwt-token "${jwtToken}"`;
  }
  let menderSetupArgs = `--quiet --device-type "${deviceType}"`;
  if (isHosted) {
    menderSetupArgs = `${menderSetupArgs} --demo --hosted-mender --tenant-token "${tenantToken}"`;
  } else if (isEnterprise) {
    menderSetupArgs = `${menderSetupArgs} --retry-poll 30 --update-poll 5 --inventory-poll 5 --server-url https://${window.location.hostname} --server-cert="" --tenant-token "${tenantToken}"`;
  } else {
    menderSetupArgs = `${menderSetupArgs} --demo${ipAddress ? ` --server-ip ${ipAddress}` : ''}`;
  }
  let scriptUrl = `https://get.mender.io`;
  if (isPreRelease) {
    scriptUrl = `${scriptUrl}/staging`;
  }
  return `wget -q -O- ${scriptUrl} | sudo bash -s -- ${installScriptArgs} -- ${menderSetupArgs}`;
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

const defaultSoftwareTitleMap = {
  'rootfs-image.version': { title: 'System filesystem', priority: 0 },
  'rootfs-image.checksum': { title: 'checksum', priority: 1 }
};

export const extractSoftwareInformation = (capabilities = {}, softwareTitleMap = defaultSoftwareTitleMap, softwareHeaderList = []) => {
  const mapLayerInformation = (key, value, i) => {
    let primary = key;
    let secondary = value;
    let priority = i + Object.keys(softwareTitleMap).length;
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
export const getDemoDeviceCreationCommand = tenantToken =>
  tenantToken
    ? `TENANT_TOKEN='${tenantToken}'\ndocker run -it -p ${onboardingReducerState.demoArtifactPort}:${onboardingReducerState.demoArtifactPort} -e SERVER_URL='https://${window.location.hostname}' \\\n-e TENANT_TOKEN=$TENANT_TOKEN --pull=always mendersoftware/mender-client-qemu`
    : './demo --client up';
