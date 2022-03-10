import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';
import SearchResult from './search-result';

const mockStore = configureStore([thunk]);

describe('SearchResult Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasDeviceConfig: true,
          hasDeviceConnect: true,
          hasMultitenancy: true,
          isHosted: true
        },
        searchState: {
          ...defaultState.app.searchState,
          isSearching: true,
          searchTerm: 'something',
          sort: {}
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <SearchResult onToggleSearchResult={jest.fn} open setSearchState={jest.fn} setSnackbar={jest.fn} />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
