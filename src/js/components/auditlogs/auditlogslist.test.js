// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { Provider } from 'react-redux';

import { prettyDOM } from '@testing-library/dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

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
