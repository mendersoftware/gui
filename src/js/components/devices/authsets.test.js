import React from 'react';
import { Provider } from 'react-redux';
import { createMount } from '@material-ui/core/test-utils';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authsets from './authsets';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Authsets Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <Authsets device={{ id: 'a1', status: 'accepted', attributes: [], auth_sets: [] }} open={true} />
      </Provider>
    );
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
