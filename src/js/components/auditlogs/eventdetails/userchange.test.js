import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import UserChange from './userchange';

describe('UserChange Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<UserChange item={defaultState.organization.auditlog.events[0]} />);

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
