import React from 'react';
import renderer from 'react-test-renderer';

// TODO: test ALL of the following!
import {
  fullyDecodeURI,
  isEncoded,
  statusToPercentage,
  decodeSessionToken,
  isEmpty,
  preformatWithRequestID,
  versionCompare,
  deepCompare,
  hashString,
  formatTime,
  formatPublicKey,
  intersection,
  customSort,
  mapDeviceAttributes,
  getFormattedSize,
  timeoutPromise,
  FileSize,
  collectAddressesFrom,
  getDemoDeviceAddress,
  detectOsIdentifier,
  findLocalIpAddress
} from './helpers';

describe('ExpandArtifact', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<FileSize fileSize={1000} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
