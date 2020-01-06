import React from 'react';
import renderer from 'react-test-renderer';
import SelectInput from './selectinput';

describe('SelectInput Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<SelectInput attachToForm={() => {}} menuItems={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
