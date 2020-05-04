import React from 'react';
import renderer from 'react-test-renderer';
import FormButton from './formbutton';
import { undefineds } from '../../../../../tests/mockData';

describe('FormButton Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<FormButton label="test" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
