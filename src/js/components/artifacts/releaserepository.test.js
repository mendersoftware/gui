import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ReleaseRepository from './releaserepository';

const mockStore = configureStore([thunk]);

describe('ReleaseRepository Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      releases: {
        byId: {},
        selectedArtifact: null,
        selectedRelease: null,
        uploading: false
      },
      users: {
        onboarding: { complete: false },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <ReleaseRepository artifacts={[]} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
