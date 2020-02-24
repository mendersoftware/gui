import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AddArtifact from './addartifact';

const mockStore = configureStore([thunk]);

describe('AddArtifact Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        selectedDevice: null,
        byStatus: {
          accepted: { deviceIds: [], total: 0 },
          pending: { deviceIds: [], total: 0 }
        }
      },
      releases: {
        byId: {}
      }
    });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <AddArtifact open={true} />
      </Provider>
    ).html();
    expect(tree).toMatchSnapshot();
  });
});
