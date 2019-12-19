import React from 'react';
import renderer from 'react-test-renderer';
import BoardIntegrations from './board-integrations';

describe('BoardIntegrations Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BoardIntegrations />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
