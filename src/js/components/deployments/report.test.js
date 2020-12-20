import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeploymentReport Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport deployment={{ id: 'a1' }} type="finished" />
        </Provider>
      </MemoryRouter>
    );
    const dialog = baseElement.getElementsByClassName('MuiDialog-root')[0];
    const view = prettyDOM(dialog, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
  });
});
