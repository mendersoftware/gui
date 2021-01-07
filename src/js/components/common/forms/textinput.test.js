import React from 'react';
import renderer from 'react-test-renderer';
import TextInput from './textinput';
import { undefineds } from '../../../../../tests/mockData';

describe('TextInput Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<TextInput attachToForm={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
