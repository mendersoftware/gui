import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import Artifacts from './artifacts';

const mockStore = configureStore([]);
const store = mockStore({
  releases: {
    uploadProgress: 0,
    selectedArtifact: null,
    selectedRelease: null,
    showRemoveDialog: false
  }
});
it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <MemoryRouter>
          <Artifacts />
        </MemoryRouter>
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
