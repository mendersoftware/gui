import React from 'react';
import renderer from 'react-test-renderer';
import DeviceListItem from './devicelistitem';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('DeviceListItem Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(<DeviceListItem device={{ id: 1 }} columnHeaders={[{ render: item => item }]} idAttribute={defaultState.users.globalSettings.id_attribute} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
