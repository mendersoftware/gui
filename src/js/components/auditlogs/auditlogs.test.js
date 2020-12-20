import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AuditLogs from './auditlogs';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);
const mockDate = new Date('2019-01-01T13:00:00.000Z');

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
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
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </MemoryRouter>
    );
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </MemoryRouter>
    );
    userEvent.click(screen.getByText(/last 7 days/i));
    userEvent.click(screen.getByText(/clear filter/i));
    userEvent.click(screen.getByRole('button', { name: /Download results as csv/i }));
  });
});
