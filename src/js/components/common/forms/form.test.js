import React from 'react';
import renderer from 'react-test-renderer';
import Form from './form';
import { undefineds } from '../../../../../tests/mockData';

describe('Form Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<Form showButtons={true} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
