import React from 'react';
import renderer from 'react-test-renderer';
import { undefineds } from '../../../../../tests/mockData';
import UserDataEntry from './userdata-entry';

describe('Login Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<UserDataEntry setSnackbar={jest.fn} onSubmit={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
