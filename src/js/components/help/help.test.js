import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer';
import Help from './help';

const mockStore = configureStore([]);
const store = mockStore({
  app: {
    features: { isHosted: false, isEnterprise: false },
    hostedLinks: {},
    versionInformation: {},
    menderDebPackageVersion: null
  },
  users: { organization: {} }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <Help location={{ pathname: 'test' }} />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
