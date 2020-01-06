import React from 'react';
import renderer from 'react-test-renderer';
import MoreHelp from './more-help-resources';

describe('MoreHelp Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<MoreHelp />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
