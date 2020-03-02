import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ScheduleRollout from './schedulerollout';

const mockStore = configureStore([thunk]);

describe('ScheduleRollout Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      users: {
        globalSettings: {
          previousPhases: []
        }
      }
    });
  });
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <ScheduleRollout />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
