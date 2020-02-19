import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Billing from './billing';

const mockStore = configureStore([thunk]);
let dateMock;

describe('Billing Component', () => {
  let store;
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    store = mockStore({
      app: {
        features: {
          isHosted: true
        }
      },
      devices: {
        byStatus: {
          accepted: {
            total: 0
          }
        },
        limit: 500
      },
      users: {
        byId: {
          a1: {
            created_ts: mockDate
          }
        },
        currentUser: 'a1',
        organization: {}
      }
    });
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Billing />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
