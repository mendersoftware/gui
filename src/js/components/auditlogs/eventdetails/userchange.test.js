import React from 'react';
import { render } from '@testing-library/react';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import UserChange from './userchange';

describe('UserChange Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserChange item={defaultState.organization.events[0]} />);

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
