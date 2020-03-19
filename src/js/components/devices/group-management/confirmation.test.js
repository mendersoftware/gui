import React from 'react';
import renderer from 'react-test-renderer';
import Confirmation from './confirmation';

describe('Group-creation-confirmation Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Confirmation newGroup="test" onConfirm={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
