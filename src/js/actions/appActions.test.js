import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';

import { commonErrorHandler, initializeAppData, setSnackbar, setFirstLoginAfterSignup } from './appActions';
import AppConstants from '../constants/appConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('app actions', () => {
  it('should handle different error message formats', async () => {
    const store = mockStore({ ...defaultState });
    const err = { response: { data: { error: { message: 'test' } } }, id: '123' };
    await expect(commonErrorHandler(err, 'testContext', store.dispatch)).rejects.toEqual(err);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          open: true,
          message: `testContext ${err.response.data.error.message}`,
          maxWidth: '900px',
          autoHideDuration: null,
          action: 'Copy to clipboard',
          children: undefined,
          onClick: undefined,
          onClose: undefined
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  // TODO: this causes jsdom based exceptions
  it('should try to get all required app information', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [];
    const action = store.dispatch(initializeAppData());
    const storeActions = store.getActions();
    action.then(([...args]) => {
      expect(args).toBeEmpty();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
    });
  });
  it('should pass snackbar information', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          open: true,
          message: 'test',
          maxWidth: '900px',
          autoHideDuration: 20,
          action: undefined,
          children: undefined,
          onClick: undefined,
          onClose: undefined
        }
      }
    ];
    await store.dispatch(setSnackbar('test', 20));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should store first login after Signup', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: true
      }
    ];
    await store.dispatch(setFirstLoginAfterSignup(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
