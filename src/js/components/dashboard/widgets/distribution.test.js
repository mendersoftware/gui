import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import Distribution from './distribution';

describe('PendingDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Distribution attribute="artifact_name" group="test" devices={{}} groups={{}} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
