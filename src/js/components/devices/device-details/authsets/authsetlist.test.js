import React from 'react';
import { render } from '@testing-library/react';
import AuthsetList from './authsetlist';
import { undefineds } from '../../../../../../tests/mockData';

describe('AuthsetList Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<AuthsetList device={{ auth_sets: [] }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
