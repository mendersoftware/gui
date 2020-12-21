import reducer, { initialState } from './appReducer';
import * as AppConstants from '../constants/appConstants';

describe('app reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_SNACKBAR', async () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: 'Run the tests' }
      }).snackbar
    ).toEqual({
      open: true,
      message: 'Run the tests'
    });

    expect(
      reducer(initialState, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: 'Run the tests' }
      }).snackbar
    ).toEqual({
      open: true,
      message: 'Run the tests'
    });
  });

  it('should handle SET_FIRST_LOGIN_AFTER_SIGNUP', async () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: true
      }).firstLoginAfterSignup
    ).toEqual(true);

    expect(
      reducer(initialState, {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: false
      }).firstLoginAfterSignup
    ).toEqual(false);
  });
  it('should handle SET_ANNOUNCEMENT', async () => {
    expect(reducer(undefined, { type: AppConstants.SET_ANNOUNCEMENT, announcement: 'something' }).hostedAnnouncement).toEqual('something');
    expect(reducer(initialState, { type: AppConstants.SET_ANNOUNCEMENT, announcement: undefined }).hostedAnnouncement).toEqual(undefined);
  });
});
