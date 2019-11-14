import React from 'react';
import renderer from 'react-test-renderer';
import { DeviceGroups } from './device-groups';
import { AppContext } from '../../contexts/app-context';

it('renders correctly', () => {
  const tree = renderer
    .create(<AppContext.Provider value={{ location: { pathname: 'test' } }}>{context => <DeviceGroups {...context} />}</AppContext.Provider>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
