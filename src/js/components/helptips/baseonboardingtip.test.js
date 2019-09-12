import React from 'react';
import renderer from 'react-test-renderer';
import BaseOnboardingTip from './baseonboardingtip';

it('renders correctly', () => {
  const tree = renderer.create(<BaseOnboardingTip anchor={{ left: 1, top: 1, right: 1, bottom: 1 }} component={<div />} />).toJSON();
  expect(tree).toMatchSnapshot();
});
