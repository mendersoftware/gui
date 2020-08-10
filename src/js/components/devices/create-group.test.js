import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateGroup from './create-group';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('CreateGroup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <Provider store={store}>
          <CreateGroup selectedDevices={[]} />
        </Provider>
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
