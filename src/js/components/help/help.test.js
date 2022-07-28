import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import Help from './help';
import { helpProps } from './mockData';
import GettingStarted from './getting-started';
import MenderHub from './mender-hub';
import Support from './support';

const mockStore = configureStore([thunk]);

describe('Help Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/help/get-started']}>
          <Routes>
            <Route path="help" element={<Help />}>
              <Route path=":section" element={null} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  describe('static components', () => {
    [GettingStarted, MenderHub, Support].forEach(Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(<Component {...helpProps} />);
        const view = baseElement.firstChild.firstChild;
        expect(view).toMatchSnapshot();
        expect(view).toEqual(expect.not.stringMatching(undefineds));
      });
    });
  });
});
