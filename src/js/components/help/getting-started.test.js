import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import GettingStarted from './getting-started';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('GettingStarted Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <GettingStarted {...helpProps} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
