import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import AuditLogsList from './auditlogslist';

const mockStore = configureStore([thunk]);

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <AuditLogsList
          items={defaultState.organization.auditlog.events}
          loading={false}
          onChangeRowsPerPage={jest.fn}
          onChangePage={jest.fn}
          onChangeSorting={jest.fn}
          selectionState={defaultState.organization.auditlog.selectionState}
          setAuditlogsState={jest.fn}
          userCapabilities={adminUserCapabilities}
        />
      </Provider>
    );

    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
