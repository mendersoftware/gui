import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);
let dateMock;

describe('DeploymentReport Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {
          ...defaultState.deployments.byId,
          d1: {
            ...defaultState.deployments.byId.d1,
            name: null,
            created: '2019-01-01',
            devices: {},
            finished: '2019-01-01',
            stats: {}
          }
        }
      }
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
    const tree = createMount()(
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport deployment={{ id: 'a1' }} type="finished" />
        </Provider>
      </MemoryRouter>
    ).html();
    expect(tree).toMatchSnapshot();
    // due to the rendering of dialogs with the mui testutils, the following does not succeed, the sub views are handled independently though
    // expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
