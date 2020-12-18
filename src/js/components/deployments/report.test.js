import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeploymentReport Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    global.Date.UTC = _Date.UTC;
    global.Date.getUTCFullYear = _Date.getUTCFullYear;
    global.Date.getUTCMonth = _Date.getUTCMonth;
    global.Date.getUTCDate = _Date.getUTCDate;
    jest.mock('moment', () => {
      return () => jest.requireActual('moment')('2019-01-01T00:00:00.000Z');
    });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport deployment={{ id: 'a1' }} type="finished" />
        </Provider>
      </MemoryRouter>
    );
    const dialog = baseElement.getElementsByClassName('MuiDialog-root')[0];
    const view = prettyDOM(dialog, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
  });
});
