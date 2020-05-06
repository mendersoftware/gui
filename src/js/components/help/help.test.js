import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer';
import Help from './help';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Help Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: { isHosted: false, isEnterprise: false },
        versionInformation: {},
        menderDebPackageVersion: null
      },
      users: { organization: {} }
    });
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
