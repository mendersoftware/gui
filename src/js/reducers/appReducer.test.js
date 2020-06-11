import reducer, { initialState } from './appReducer';
import * as AppConstants from '../constants/appConstants';

describe('app reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_SNACKBAR', () => {
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

  it('should handle SET_LOCAL_IPADDRESS', () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_LOCAL_IPADDRESS,
        ipAddress: '127.0.0.1'
      }).hostAddress
    ).toEqual('127.0.0.1');

    expect(
      reducer(initialState, {
        type: AppConstants.SET_LOCAL_IPADDRESS,
        ipAddress: '127.0.0.1'
      }).hostAddress
    ).toEqual('127.0.0.1');
  });
});
