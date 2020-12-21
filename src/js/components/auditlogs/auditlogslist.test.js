import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AuditLogsList from './auditlogslist';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Auditlogs Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <AuditLogsList
              count={defaultState.organization.eventsTotal}
              items={defaultState.organization.events}
              loading={false}
              page={1}
              onChangeRowsPerPage={jest.fn}
              onChangePage={jest.fn}
              onChangeSorting={jest.fn}
              perPage={20}
              sortDirection="desc"
            />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
