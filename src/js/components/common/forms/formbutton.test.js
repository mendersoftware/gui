import React from 'react';
import renderer from 'react-test-renderer';
import FormButton from './formbutton';

describe('FormButton Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<FormButton label="test" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
