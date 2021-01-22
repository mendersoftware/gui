import React from 'react';
import { render } from '@testing-library/react';
import AuthStatus from './authstatus';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('AuthStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <AuthStatus
        device={{
          ...defaultState.devices.byId.a1,

          auth_sets: [
            ...defaultState.devices.byId.a1.auth_sets,
            {
              ...defaultState.devices.byId.a1.auth_sets[0],
              status: 'pending'
            }
          ]
        }}
        toggleAuthsets={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
