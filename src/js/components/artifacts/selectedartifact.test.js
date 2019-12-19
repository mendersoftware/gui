import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SelectedArtifact from './selectedartifact';

const mockStore = configureStore([thunk]);
const store = mockStore({});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <SelectedArtifact artifact={{ description: 'text' }} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
