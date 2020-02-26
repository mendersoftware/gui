import React from 'react';
import renderer from 'react-test-renderer';

// TODO: test ALL of the following!
// [
//   fullyDecodeURI,
//   isEncoded,
//   statusToPercentage,
//   decodeSessionToken,
//   isEmpty,
//   preformatWithRequestID,
//   versionCompare,
//   deepCompare,
//   hashString,
//   formatTime,
//   formatPublicKey,
//   intersection,
//   customSort,
//   mapDeviceAttributes,
//   getFormattedSize,
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
