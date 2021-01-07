import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import GettingStarted from './getting-started';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <GettingStarted {...helpProps} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
