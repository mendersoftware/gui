import React from 'react';
import renderer from 'react-test-renderer';
import Form from './form';

it('renders correctly', () => {
  const tree = renderer.create(<Form showButtons={true} />).toJSON();
  expect(tree).toMatchSnapshot();
});
