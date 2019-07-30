import React from 'react';
import renderer from 'react-test-renderer';
import Past from './pastdeployments';

it('renders correctly', () => {
  const tree = renderer.create(<Past past={[]} groups={[]} refreshPast={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
