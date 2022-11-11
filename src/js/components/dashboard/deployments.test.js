import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Deployments from './deployments';

const mockStore = configureStore([thunk]);

describe('Deployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Deployments clickHandle={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
