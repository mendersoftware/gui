import React from 'react';
import renderer from 'react-test-renderer';
import TextInput from './textinput';

it('renders correctly', () => {
  const tree = renderer.create(<TextInput attachToForm={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
