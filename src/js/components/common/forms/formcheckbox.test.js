import React from 'react';
import renderer from 'react-test-renderer';
import FormCheckbox from './formcheckbox';

it('renders correctly', () => {
  const tree = renderer.create(<FormCheckbox attachToForm={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
