import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import RedirectionWidget from './redirectionwidget';
import { undefineds } from '../../../../../tests/mockData';

describe('RedirectionWidget Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <RedirectionWidget target="testlocation" buttonContent={<div />} />
      </MemoryRouter>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
