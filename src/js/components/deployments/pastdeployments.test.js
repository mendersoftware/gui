import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);
let dateMock;

describe('PastDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      deployments: {
        byId: {},
        byStatus: {
          finished: {
            selectedDeploymentIds: []
          }
        }
      },
      users: { onboarding: { complete: false, showTips: true }, showHelptips: true }
    });
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
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
