import React from 'react';
import renderer from 'react-test-renderer';
import Alert from './alert';
import { undefineds } from '../../../../tests/mockData';

describe('Alert Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <Alert className="margin-top-small" severity="error">
          Content
        </Alert>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
