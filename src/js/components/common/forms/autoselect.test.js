import React from 'react';
import renderer from 'react-test-renderer';
import AutoSelect from './autoselect';

describe('AutoSelect Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AutoSelect items={[]} label="test" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
