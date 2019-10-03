import jwtDecode from 'jwt-decode';
import md5 from 'md5';
import React from 'react';

import AppActions from './actions/app-actions';
import AppStore from './stores/app-store';

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

export function statusToPercentage(state, intervals) {
  var time;
  var minutes = intervals / 3;
  switch (state) {
  case 'pending':
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
  case 'noartifact':
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

/*
 * compare version strings like 1.2.1, 1.2.0 etc
 * from https://gist.github.com/TheDistantSea/8021359
 */
export function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split('.'),
    v2parts = v2.split('.');

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push('0');
    while (v2parts.length < v1parts.length) v2parts.push('0');
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}

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

export const mapDeviceAttributes = attributes =>
  attributes.reduce((accu, attribute) => Object.assign(accu, { [attribute.name]: attribute.value }), { device_type: '', artifact_name: '' });

export const getFormattedSize = bytes => {
  const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (!bytes) {
    return '0 Bytes';
  }
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export class FileSize extends React.PureComponent {
  render() {
    return <div style={this.props.style}>{getFormattedSize(this.props.fileSize)}</div>;
  }
}

export const timeoutPromise = (url, options = {}, timeout = 1000) =>
  Promise.race([fetch(url, options), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))]);

export const collectAddressesFrom = devices =>
  devices.reduce((collector, device) => {
    const ips = device.attributes.reduce((accu, item) => {
      if (item.name.startsWith('ipv4')) {
        if (Array.isArray(item.value)) {
          const texts = item.value.map(text => text.slice(0, text.indexOf('/')));
          accu.push(...texts);
        } else {
          const text = item.value.slice(0, item.value.indexOf('/'));
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
  return AppActions.getDevicesWithInventory(devices).then(devices => {
    const addresses = collectAddressesFrom(devices);
    const address = addresses.reduce((accu, item) => {
      if (accu && item === defaultVitualizedIp) {
        return accu;
      }
      return item;
    }, null);
    const onboardingApproach = AppStore.getOnboardingApproach();
    const port = AppStore.getDemoArtifactPort();
    targetUrl = `http://${address}:${port}`;
    if (!address || (onboardingApproach === 'virtual' && (navigator.appVersion.indexOf('Win') != -1 || navigator.appVersion.indexOf('Mac') != -1))) {
      targetUrl = `http://localhost:${port}`;
    }
    return Promise.resolve(targetUrl);
  });
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
  // use this to get remaining percent of last phase so we don't set a hard number
  let remainder = 100;
  for (let phase of phases) {
    remainder = phase.batch_size ? remainder - phase.batch_size : remainder;
  }
  return remainder;
};
