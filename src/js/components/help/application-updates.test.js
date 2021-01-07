import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ApplicationUpdates from './application-updates';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('ApplicationUpdates Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <ApplicationUpdates {...helpProps} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
