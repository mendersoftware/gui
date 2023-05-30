// Copyright 2022 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { Provider } from 'react-redux';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { accessTokens, defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import AccessTokenManagement, {
  AccessTokenCreationDialog,
  AccessTokenRevocationDialog,
  AccessTokenManagement as DisconnectedAccessTokenManagement
} from './accesstokenmanagement';

const mockStore = configureStore([thunk]);

describe('UserManagement Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true
        }
      },
      users: {
        ...defaultState.users,
        byId: {
          ...defaultState.users.byId,
          [defaultState.users.currentUser]: {
            ...defaultState.users.byId[defaultState.users.currentUser],
            tokens: accessTokens
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <AccessTokenManagement generateToken={jest.fn} getTokens={jest.fn} revokeToken={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const createMock = jest.fn();
    const getMock = jest.fn();
    const removeMock = jest.fn();
    const ui = (
      <DisconnectedAccessTokenManagement
        generateToken={createMock}
        getTokens={getMock}
        revokeToken={removeMock}
        isEnterprise={false}
        rolesById={defaultState.users.rolesById}
        tokens={[]}
        userRoles={['test']}
      />
    );
    const { rerender } = render(ui);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: /generate a token/i }));
    const generateButton = screen.getByRole('button', { name: /create token/i });
    expect(generateButton).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/name/i), 'somename');
    expect(generateButton).not.toBeDisabled();
    createMock.mockResolvedValue([Promise.resolve(), 'aNewToken']);
    await user.click(generateButton);
    expect(createMock).toHaveBeenCalledWith({ expiresIn: 31536000, name: 'somename' });
    await waitFor(() => rerender(ui));
    expect(screen.queryByText('aNewToken')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create token/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  [AccessTokenCreationDialog, AccessTokenRevocationDialog].forEach(async (Component, index) => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          onCancel={jest.fn}
          generateToken={jest.fn}
          revokeToken={jest.fn}
          setToken={jest.fn}
          token={index ? accessTokens[0] : 'afreshtoken'}
          userRoles={[]}
        />
      );
      const view = baseElement.getElementsByClassName('MuiPaper-root')[0];
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
