import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import TerminalDialog from './terminal';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('TerminalDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = createMount()(
      <Provider store={store}>
        <TerminalDialog onCancel={jest.fn} open={true} />
      </Provider>
    ).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
