import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Past from './pastdeployments';

const mockStore = configureStore([thunk]);

describe('PastDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {},
        selectionState: {
          ...defaultState.deployments.selectionState,
          finished: {
            selection: []
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <Past past={[]} groups={[]} refreshPast={() => {}} refreshDeployments={jest.fn} />
        </Provider>
      </LocalizationProvider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
