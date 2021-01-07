import React from 'react';
import renderer from 'react-test-renderer';
import BoardIntegrations from './board-integrations';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('BoardIntegrations Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<BoardIntegrations {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
