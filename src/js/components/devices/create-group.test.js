import React from 'react';
import renderer from 'react-test-renderer';
import CreateGroup from './create-group';

it('renders correctly', () => {
  const tree = renderer.create(<CreateGroup open={false} />).toJSON();
  expect(tree).toMatchSnapshot();
});
