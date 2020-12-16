import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeviceInventory from './deviceinventory';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('CreateGroup Component', () => {
  it('renders correctly', () => {
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
    const tree = renderer
      .create(
        <MemoryRouter>
          <DeviceInventory attributes={attributes} id="a1" setSnackbar={jest.fn} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
