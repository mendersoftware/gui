import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { AuthButton, ExpandArtifact, ExpandDevice, AddGroup } from './helptooltips';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Helptooltips Components', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasMultitenancy: true,
          isHosted: true
        }
      }
    });
  });

  describe('AuthButton', () => {
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <MemoryRouter>
            <Provider store={store}>
              <AuthButton />
            </Provider>
          </MemoryRouter>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('ExpandArtifact', () => {
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <ExpandArtifact />
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('ExpandDevice', () => {
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <ExpandDevice />
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('AddGroup', () => {
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <AddGroup />
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
