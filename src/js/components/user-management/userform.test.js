import React from 'react';
import renderer from 'react-test-renderer';
import UserForm from './userform';

describe('UserForm Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UserForm />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
