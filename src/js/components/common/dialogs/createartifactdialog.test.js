import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreateArtifactDialog from './createartifactdialog';

const mockStore = configureStore([thunk]);
const store = mockStore({
  app: {
    versionInformation: {}
  },
  users: { onboarding: { deviceType: 'qemux86-64' } }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <CreateArtifactDialog />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
