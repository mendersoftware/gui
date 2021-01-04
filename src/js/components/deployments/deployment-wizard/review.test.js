import React from 'react';
import renderer from 'react-test-renderer';
import Review from './review';

describe('Review deployment Component', () => {
  it('renders correctly', async () => {
    const release = { Name: 'test-release', device_types_compatible: [], phases: [] };
    const tree = renderer.create(<Review group="test" release={release} deploymentDeviceIds={[]} deploymentDeviceCount={0} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
