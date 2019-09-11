import React from 'react';
import renderer from 'react-test-renderer';
import Past from './pastdeployments';

it('renders correctly', () => {
  const mockDate = new Date('2019-01-01');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  const tree = renderer.create(<Past past={[]} groups={[]} refreshPast={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
