import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceInventory from './deviceinventory';

describe('DeviceInventory Component', () => {
  it('renders correctly', async () => {
    const attributes = {
      ...defaultState.devices.byId.a1.attributes,
      artifact_name: 'myapp',
      'rootfs-image.version': 'stablev1-beta-final-v0',
      'rootfs-image.checksum': '12341143',
      'test.version': 'test-2',
      'a.whole.lot.of.dots.version': 'test-3',
      'a.whole.lot.of.dots.more': 'test-4',
      'even.more.dots.than.before.version': 'test-5',
      'even.more.dots.than.before.more': 'test-6'
    };
    const { baseElement } = render(<DeviceInventory device={{ attributes, id: 'a1' }} setSnackbar={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
