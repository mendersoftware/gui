import React from 'react';
import renderer from 'react-test-renderer';
import { undefineds } from '../../../../../tests/mockData';
import OrgDataEntry from './orgdata-entry';

describe('Login Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<OrgDataEntry setSnackbar={jest.fn} onSubmit={jest.fn} recaptchaSiteKey="test" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
