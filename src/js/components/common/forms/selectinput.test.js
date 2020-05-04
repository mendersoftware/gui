import React from 'react';
import renderer from 'react-test-renderer';
import SelectInput from './selectinput';
import { undefineds } from '../../../../../tests/mockData';

describe('SelectInput Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<SelectInput attachToForm={() => {}} menuItems={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
