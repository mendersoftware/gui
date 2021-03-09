import React from 'react';
import { render } from '@testing-library/react';
import Review from './review';
import { undefineds } from '../../../../../tests/mockData';

describe('Review deployment Component', () => {
  it('renders correctly', async () => {
    const release = { Name: 'test-release', device_types_compatible: [], phases: [] };
    const { baseElement } = render(<Review group="test" release={release} deploymentDeviceIds={[]} deploymentDeviceCount={0} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
