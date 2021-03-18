import React from 'react';
import { render } from '@testing-library/react';
import Terminal from './terminal';
import { undefineds } from '../../../../../tests/mockData';

describe('Terminal Component', () => {
  const oldMatchMedia = window.matchMedia;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });
  });

  afterEach(() => {
    window.matchMedia = oldMatchMedia;
  });

  it('renders correctly', async () => {
    const { baseElement } = render(<Terminal />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
