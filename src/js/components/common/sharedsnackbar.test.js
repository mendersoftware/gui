import React from 'react';
import renderer from 'react-test-renderer';
import SharedSnackbar from './sharedsnackbar';

it('renders correctly', () => {
  const tree = renderer.create(<SharedSnackbar snackbar={{ maxWidth: 200 }} />).toJSON();
  expect(tree).toMatchSnapshot();
});
