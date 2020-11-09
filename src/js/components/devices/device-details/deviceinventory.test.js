import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeviceInventory from './deviceinventory';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('CreateGroup Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <DeviceInventory attributes={defaultState.devices.byId.a1.attributes} id="a1" setSnackbar={jest.fn} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
