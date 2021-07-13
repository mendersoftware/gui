import React from 'react';
import { render } from '@testing-library/react';
import AcceptedDevices from './accepteddevices';
import { undefineds } from '../../../../../tests/mockData';

describe('AcceptedDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<AcceptedDevices />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
