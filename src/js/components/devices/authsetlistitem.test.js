import React from 'react';
import renderer from 'react-test-renderer';
import AuthsetListItem from './authsetlistitem';
import { undefineds } from '../../../../tests/mockData';

describe('AuthsetList Component', () => {
  it('renders correctly', () => {
    const authset = {
      id: '123',
      identity_data: { mac: '24:7d:30:90:21:a8' },
      pubkey: `-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA4XP347xOgC0PnBgplast
GmsSDWZE2nMCAkV9wx2J09hzqlEWK8tOOIS99IpAR4TtwIQi2GssNyGBBNRNMfLi
8E2JLalm/X2jFdutf4QVIvLOs1vT0FqpYH+B3BnocYC5TfBXAwVUoW8HxK0MuxBo
UTixFC4o2Wu3fQs+mMiVnV/jcYAV1O0N4+lgszObX8Buq8l817HB3WzUw/XxOyxC
yahN4skp1D9JFHZB3i6lnfSJNJJvABe/lLf2jnjeFzbBgJOGxzolBa3+UyAWJRLB
JxsSxbbnXS3vAwODZEBQ1VSs43en1o5IT/Z/79UC6wAKg+Z4VnkdcK0b9EsW9VQU
oIfVXZjmm5CWPMiV5f9gG2t36j2wydpDryYqEAE+n8N76JzD/ZKlmHo+FJBJNsSx
Hcoq3VRgR5v53BTLFZLLBaqLIqnQAUwn/RcWlEbS3dEGQDvKglNjwmSVf6Myub5w
gnr0OSIDwEL31l+12DbAQ9+ANv6TLpWNfLpX0E6IStkZAgMBAAE=
-----END PUBLIC KEY-----
`,
      ts: '2020-09-21T12:42:34.571Z',
      status: 'accepted'
    };
    const device = {
      id: 'a7503dcc-afb6-4926-897e-3b1346d1600f',
      attributes: { device_type: '', artifact_name: '' },
      updated_ts: '2020-09-21T12:42:38.751Z',
      identity_data: { mac: '24:7d:30:90:21:a8', status: 'accepted' },
      status: 'accepted',
      created_ts: '2020-09-21T12:42:34.567Z',
      auth_sets: [authset]
    };

    const tree = renderer
      .create(
        <AuthsetListItem
          authset={authset}
          isActive={true}
          isExpanded={true}
          onExpand={jest.fn}
          confirm={jest.fn}
          device={device}
          limitMaxed={false}
          loading={false}
          total={10}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
