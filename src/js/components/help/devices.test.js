import React from 'react';
import renderer from 'react-test-renderer';
import Devices from './devices';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<Devices {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
