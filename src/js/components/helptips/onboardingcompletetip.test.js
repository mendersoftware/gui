import React from 'react';
import renderer from 'react-test-renderer';
import { OnboardingCompleteTip } from './onboardingcompletetip';

it('renders correctly', () => {
  const tree = renderer.create(<OnboardingCompleteTip />).toJSON();
  expect(tree).toMatchSnapshot();
});
