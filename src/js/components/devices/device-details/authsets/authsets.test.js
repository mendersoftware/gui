import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authsets from './authsets';
import { defaultState, undefineds } from '../../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Authsets Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Authsets
          device={{ id: 'a1', status: 'accepted', attributes: [], auth_sets: [] }}
          id_attribute={defaultState.users.globalSettings.id_attribute}
          open={true}
        />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
