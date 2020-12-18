import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SoftwareDistribution from './software-distribution';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      users: {
        ...defaultState.users,
        globalSettings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            reports: [{ group: Object.keys(defaultState.devices.groups.byId)[0], attribute: 'artifact_name', type: 'distribution' }]
          }
        }
      }
    });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <SoftwareDistribution getAllDevicesByStatus={jest.fn()} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
