import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import CreateArtifactDialog from './createartifactdialog';

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

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <CreateArtifactDialog />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
