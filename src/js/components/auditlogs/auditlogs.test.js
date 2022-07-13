import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { prettyDOM } from '@testing-library/dom';
import { act, screen, render as testingLibRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import AuditLogs from './auditlogs';

const mockStore = configureStore([thunk]);

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </LocalizationProvider>
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
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <AuditLogs />
        </Provider>
      </LocalizationProvider>
    );
    act(() => userEvent.click(screen.getByText(/last 7 days/i)));
    act(() => userEvent.click(screen.getByText(/clear filter/i)));
    act(() => userEvent.click(screen.getByRole('button', { name: /Download results as csv/i })));
    act(() => userEvent.click(screen.getByText(/open_terminal/i)));
  });

  it('allows navigating by url as expected', async () => {
    const ui = (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <MemoryRouter initialEntries={['/auditlog?startDate=2020-01-01']}>
          <Provider store={store}>
            <AuditLogs />
          </Provider>
        </MemoryRouter>
      </LocalizationProvider>
    );
    const { rerender } = testingLibRender(ui);
    await waitFor(() => rerender(ui));
    act(() => userEvent.click(screen.getByText(/clear filter/i)));
  });
});
