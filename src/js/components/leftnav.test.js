import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import LeftNav from './leftnav';

const mockStore = configureStore([thunk]);

describe('LeftNav Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { features: { isHosted: false }, versionInformation: {} }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <MemoryRouter>
            <LeftNav />
          </MemoryRouter>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
