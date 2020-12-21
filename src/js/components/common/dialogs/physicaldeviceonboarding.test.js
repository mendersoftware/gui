import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PhysicalDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <PhysicalDeviceOnboarding progress={1} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
