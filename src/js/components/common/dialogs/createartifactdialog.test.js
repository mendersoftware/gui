import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateArtifactDialog from './createartifactdialog';

const mockStore = configureStore([thunk]);

describe('CreateArtifactDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        versionInformation: {
          'Mender-Client': 'master',
          'Mender-Artifact': 'master'
        }
      },
      users: { onboarding: { deviceType: 'qemux86-64' } }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <CreateArtifactDialog open={true} />
      </Provider>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
