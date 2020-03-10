import React from 'react';
import renderer from 'react-test-renderer';
import { duplicateFilter, getFormattedSize, hashString, isEmpty, mapDeviceAttributes, stringToBoolean, unionizeStrings } from './helpers';

// TODO: test ALL of the following!
// [
//   fullyDecodeURI,
//   isEncoded,
//   statusToPercentage,
//   decodeSessionToken,
//   preformatWithRequestID,
//   versionCompare,
//   deepCompare,
//   formatTime,
//   formatPublicKey,
//   intersection,
//   customSort,
//   timeoutPromise,
//   collectAddressesFrom,
//   getDemoDeviceAddress,
//   detectOsIdentifier,
//   findLocalIpAddress
// ];
import { FileSize } from './helpers';

describe('FileSize Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<FileSize fileSize={1000} />).toJSON();
    expect(tree).toMatchSnapshot();
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
  it('removes duplicastes from an array', () => {
    const defaultAttributes = { device_type: '', artifact_name: '' };
    expect(mapDeviceAttributes()).toEqual(defaultAttributes);
    expect(mapDeviceAttributes([])).toEqual(defaultAttributes);
    const testAttributesObject1 = { name: 'this1', value: 'that1' };
    expect(mapDeviceAttributes([testAttributesObject1])).toEqual({ this1: 'that1', ...defaultAttributes });
    const testAttributesObject2 = { name: 'this2', value: 'that2' };
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2])).toEqual({ this1: 'that1', this2: 'that2', ...defaultAttributes });
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2, testAttributesObject2])).toEqual({
      this1: 'that1',
      this2: 'that2',
      ...defaultAttributes
    });
  });
});
