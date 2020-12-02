import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createMount } from '@material-ui/core/test-utils';
import CreateArtifactDialog from './createartifactdialog';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('CreateArtifactDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      onboarding: {
        ...defaultState.onboarding,
        showCreateArtifactDialog: undefined
      }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <Provider store={store}>
          <CreateArtifactDialog />
        </Provider>
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
