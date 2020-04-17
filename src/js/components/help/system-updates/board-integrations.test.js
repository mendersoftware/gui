import React from 'react';
import renderer from 'react-test-renderer';
import BoardIntegrations from './board-integrations';
import { helpProps } from '../mockData';

describe('BoardIntegrations Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BoardIntegrations {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
