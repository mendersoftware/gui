import React from 'react';
import renderer from 'react-test-renderer';
import Confirm from './confirm';
import { undefineds } from '../../../../tests/mockData';

describe('Confirm Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Confirm type="abort" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
