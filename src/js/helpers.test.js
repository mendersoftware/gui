import React from 'react';
import renderer from 'react-test-renderer';
import {
  duplicateFilter,
  FileSize,
  getDebConfigurationCode,
  getDebInstallationCode,
  getDemoDeviceCreationCommand,
  getFormattedSize,
  getPhaseDeviceCount,
  hashString,
  isEmpty,
  mapDeviceAttributes,
  stringToBoolean,
  unionizeStrings
} from './helpers';
import { undefineds } from '../../tests/mockData';

// TODO: test ALL of the following!
// [
//   fullyDecodeURI,
//   isEncoded,
//   statusToPercentage,
//   decodeSessionToken,
//   preformatWithRequestID,
//   deepCompare,
//   formatTime,
//   formatPublicKey,
//   customSort,
//   collectAddressesFrom,
//   getDemoDeviceAddress,
//   detectOsIdentifier,
// ];

describe('FileSize Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<FileSize fileSize={1000} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).not.toMatch(undefineds);
  });
});

describe('getFormattedSize function', () => {
  it('converts correctly', () => {
    expect(getFormattedSize()).toEqual('0 Bytes');
    expect(getFormattedSize(null)).toEqual('0 Bytes');
    expect(getFormattedSize(0)).toEqual('0 Bytes');
    expect(getFormattedSize(31)).toEqual('31.00 Bytes');
    expect(getFormattedSize(1024)).toEqual('1.00 KB');
    expect(getFormattedSize(1024 * 1024)).toEqual('1.00 MB');
    expect(getFormattedSize(1024 * 1024 * 2.5)).toEqual('2.50 MB');
    expect(getFormattedSize(1024 * 1024 * 1024 * 1.2345)).toEqual('1.23 GB');
  });
});

describe('isEmpty function', () => {
  it('should identify empty objects', () => {
    expect(isEmpty({})).toEqual(true);
  });
  it('should identify non-empty objects', () => {
    expect(isEmpty({ a: 1 })).toEqual(false);
  });
  it('should identify an object with nested empty objects as non-empty', () => {
    expect(isEmpty({ a: {} })).toEqual(false);
  });
});

describe('stringToBoolean function', () => {
  it('should convert truthy objects', () => {
    expect(stringToBoolean(1)).toEqual(true);
    expect(stringToBoolean('1')).toEqual(true);
    expect(stringToBoolean(true)).toEqual(true);
    expect(stringToBoolean('yes')).toEqual(true);
    expect(stringToBoolean('TRUE')).toEqual(true);
  });
  it('should convert truthy objects', () => {
    expect(stringToBoolean(0)).toEqual(false);
    expect(stringToBoolean('0')).toEqual(false);
    expect(stringToBoolean(false)).toEqual(false);
    expect(stringToBoolean('no')).toEqual(false);
    expect(stringToBoolean('FALSE')).toEqual(false);
  });
});

describe('getDebInstallationCode function', () => {
  it('should not contain any template string leftovers', () => {
    expect(getDebInstallationCode()).not.toMatch(/\{([^}]+)\}/);
  });
  it('should return a sane result', () => {
    expect(getDebInstallationCode()).toMatch(`wget -q -O- https://get.mender.io/ | sudo bash -s -- -c experimental`);
  });
});

describe('getDebConfigurationCode function', () => {
  let code;
  beforeEach(() => {
    code = getDebConfigurationCode('192.168.7.41', false, true, 'token', 'master', 'raspberrypi3');
  });
  it('should not contain any template string leftovers', () => {
    expect(code).not.toMatch(/\{([^}]+)\}/);
  });
  it('should return a sane result', () => {
    expect(code).toMatch(
      `wget -q -O- https://get.mender.io/ | sudo bash -s -- -c experimental && \\
sudo bash -c 'DEVICE_TYPE="raspberrypi3" && \\
TENANT_TOKEN="token" && \\
mender setup \\
  --device-type $DEVICE_TYPE \\
  --quiet --demo --server-ip 192.168.7.41 \\
  --tenant-token $TENANT_TOKEN && \\
systemctl restart mender-client'`
    );
  });
  it('should not contain tenant information for OS calls', () => {
    code = getDebConfigurationCode('192.168.7.41', false, false, null, 'master', 'raspberrypi3');
    expect(code).not.toMatch(/tenant/);
    expect(code).not.toMatch(/token/);
  });
});

describe('getDemoDeviceCreationCommand function', () => {
  const token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW5kZXIudGVuYW50IjoiNWY5YWI0ZWQ4ZjhhMzc0NmYwYTIxNjU1IiwiaXNzIjoiTWVuZGVyIiwic3`;
  it('should not contain any template string leftovers', () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).not.toMatch(/\{([^}]+)\}/);
    code = getDemoDeviceCreationCommand(token);
    expect(code).not.toMatch(/\{([^}]+)\}/);
  });
  it('should return a sane result', () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).toMatch('./demo --client up');
    code = getDemoDeviceCreationCommand(token);
    expect(code).toMatch(
      `TENANT_TOKEN='${token}'\ndocker run -it -p 85:85 -e SERVER_URL='https://localhost' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest`
    );
  });
});

describe('hashString function', () => {
  it('should use md5 hashing internally', () => {
    const md5Hash = '098f6bcd4621d373cade4e832627b4f6';
    expect(hashString('test')).toEqual(md5Hash);
  });
});

describe('duplicateFilter function', () => {
  it('removes duplicastes from an array', () => {
    expect([].filter(duplicateFilter)).toEqual([]);
    expect([1, 1, 2, 3, 4, 5].filter(duplicateFilter)).toEqual([1, 2, 3, 4, 5]);
    expect(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'].filter(duplicateFilter)).toEqual(['hey', 'ho', 'heyho']);
  });
});

describe('unionizeStrings function', () => {
  it('joins arrays of strings to a list of distinct strings', () => {
    expect(unionizeStrings([], [])).toEqual([]);
    expect(unionizeStrings(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'], ['hohoho'])).toEqual(['hey', 'ho', 'heyho', 'hohoho']);
    expect(unionizeStrings(['hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
    expect(unionizeStrings(['hohoho', 'hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
  });
});

describe('mapDeviceAttributes function', () => {
  const defaultAttributes = {
    inventory: { device_type: '', artifact_name: '' },
    identity: {},
    system: {}
  };
  it('works with empty attributes', () => {
    expect(mapDeviceAttributes()).toEqual(defaultAttributes);
    expect(mapDeviceAttributes([])).toEqual(defaultAttributes);
  });
  it('handles unscoped attributes', () => {
    const testAttributesObject1 = { name: 'this1', value: 'that1' };
    expect(mapDeviceAttributes([testAttributesObject1])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    const testAttributesObject2 = { name: 'this2', value: 'that2' };
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1',
        this2: 'that2'
      }
    });
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1',
        this2: 'that2'
      }
    });
  });
  it('handles scoped attributes', () => {
    const testAttributesObject1 = { name: 'this1', value: 'that1', scope: 'inventory' };
    expect(mapDeviceAttributes([testAttributesObject1])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    const testAttributesObject2 = { name: 'this2', value: 'that2', scope: 'identity' };
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      identity: {
        ...defaultAttributes.identity,
        this2: 'that2'
      },
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      identity: {
        ...defaultAttributes.identity,
        this2: 'that2'
      },
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
  });
});

describe('getPhaseDeviceCount function', () => {
  it('works with empty attributes', () => {
    expect(getPhaseDeviceCount(120, 10, 20, false)).toEqual(12);
    expect(getPhaseDeviceCount(120, 10, 20, true)).toEqual(12);
    expect(getPhaseDeviceCount(120, null, 20, true)).toEqual(24);
    expect(getPhaseDeviceCount(120, null, 20, false)).toEqual(24);
  });
});
