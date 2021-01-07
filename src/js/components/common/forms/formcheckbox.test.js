import React from 'react';
import renderer from 'react-test-renderer';
import FormCheckbox from './formcheckbox';
import { undefineds } from '../../../../../tests/mockData';

describe('FormCheckbox Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<FormCheckbox attachToForm={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
