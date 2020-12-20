import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);
const mockDate = new Date('2019-01-01T13:00:00.000Z');

describe('PastDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {},
        byStatus: {
          ...defaultState.deployments.byStatus,
          finished: {
            selectedDeploymentIds: []
          }
        }
      }
    });
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    global.Date.UTC = _Date.UTC;
    global.Date.getUTCFullYear = _Date.getUTCFullYear;
    global.Date.getUTCMonth = _Date.getUTCMonth;
    global.Date.getUTCDate = _Date.getUTCDate;
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Past past={[]} groups={[]} refreshPast={() => {}} refreshDeployments={jest.fn} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
