import React from 'react';
import renderer from 'react-test-renderer';
import BoardIntegrations from './board-integrations';

it('renders correctly', () => {
  const tree = renderer.create(<BoardIntegrations />).toJSON();
  expect(tree).toMatchSnapshot();
});
