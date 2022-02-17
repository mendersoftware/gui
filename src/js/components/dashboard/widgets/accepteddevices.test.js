import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import AcceptedDevices from './accepteddevices';

describe('AcceptedDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<AcceptedDevices />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
