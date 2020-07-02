import React from 'react';
import renderer from 'react-test-renderer';
import Announcement from './announcement';
import { undefineds } from '../../../../tests/mockData';

describe('Announcement Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Announcement />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
