import React from 'react';
import renderer from 'react-test-renderer';
import UserForm from './userform';
import { undefineds } from '../../../../tests/mockData';

describe('UserForm Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UserForm />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
