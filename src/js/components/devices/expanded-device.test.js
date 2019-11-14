import React from 'react';
import renderer from 'react-test-renderer';
import { ExpandedDevice } from './expanded-device';

it('renders correctly', () => {
  const tree = renderer.create(<ExpandedDevice device={{ status: 'accepted', attributes: [], auth_sets: [] }} attrs={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
