import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Signup from './signup';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Signup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Signup match={{ params: { campaign: '' } }} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  // TODO - reenable once jest 27 is stable
  // it('allows signing up', async () => {
  //   const { container } = render(
  //     <MemoryRouter>
  //       <Provider store={store}>
  //         <Signup location={{ state: { from: '' } }} />
  //         <Switch>
  //           <Route path="/">
  //             <div>signed up</div>
  //           </Route>
  //         </Switch>
  //       </Provider>
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Sign up with:')).toBeInTheDocument();
  //   userEvent.type(screen.getByLabelText('Email *'), 'test@example.com');
  //   await userEvent.type(screen.getByLabelText('Password *'), 'mysecretpassword!123', { delay: 30 });
  //   expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  //   userEvent.type(screen.getByLabelText('Confirm password *'), 'mysecretpassword!123');
  //   expect(container.querySelector('#pass-strength > svg')).toBeVisible();
  //   expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled();
  //   userEvent.click(screen.getByRole('button', { name: /sign up/i }));
  //   await waitFor(() => screen.getByText('Company or organization name *'));

  //   userEvent.type(screen.getByRole('textbox', { name: /company or organization name \*/i }), 'test');
  //   expect(screen.getByRole('button', { name: /complete signup/i })).toBeDisabled();
  //   userEvent.click(screen.getByRole('checkbox', { name: /by checking this you agree to our/i }));
  //   expect(screen.getByRole('button', { name: /complete signup/i })).toBeEnabled();

  //   const cookies = new Cookies();
  //   cookies.set.mockReturnValue();
  //   await userEvent.click(screen.getByRole('button', { name: /complete signup/i }));
  //   await waitFor(() => expect(container.querySelector('.loaderContainer')).toBeVisible());
  //   await expect(setTimeout).toHaveBeenCalledTimes(1);
  //   jest.advanceTimersByTime(5000);
  //   await waitFor(() => expect(cookies.set).toHaveBeenCalledTimes(2));
  //   await waitFor(() => screen.getByText(/signed up/i));
  // });
});
