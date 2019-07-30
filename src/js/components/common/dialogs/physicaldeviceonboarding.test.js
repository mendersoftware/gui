import React from 'react';
import renderer from 'react-test-renderer';
import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import * as helpers from '../../../helpers';

it('renders correctly', () => {
  jest.spyOn(helpers, 'findLocalIpAddress').mockImplementationOnce(() => Promise.resolve(2));
  const tree = renderer.create(<PhysicalDeviceOnboarding />).toJSON();
  expect(tree).toMatchSnapshot();
});
