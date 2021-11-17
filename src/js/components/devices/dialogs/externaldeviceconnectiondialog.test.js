import React from 'react';
import { render } from '@testing-library/react';
import ExternalDeviceConnectionDialog from './externaldeviceconnectiondialog';
import { undefineds } from '../../../../../tests/mockData';

describe('ExternalDeviceConnectionDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ExternalDeviceConnectionDialog connectionString="something" provider="azure" onClose={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
