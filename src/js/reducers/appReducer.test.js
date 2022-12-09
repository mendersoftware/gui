import * as AppConstants from '../constants/appConstants';
import reducer, { initialState } from './appReducer';

const snackbarMessage = 'Run the tests';

describe('app reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should handle SET_SNACKBAR', async () => {
    expect(
      reducer(undefined, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: snackbarMessage }
      }).snackbar
    ).toEqual({
      open: true,
      message: snackbarMessage
    });

    expect(
      reducer(initialState, {
        type: AppConstants.SET_SNACKBAR,
        snackbar: { open: true, message: snackbarMessage }
      }).snackbar
    ).toEqual({
      open: true,
      message: snackbarMessage
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
  it('should handle SET_SEARCH_STATE', async () => {
    expect(reducer(undefined, { type: AppConstants.SET_SEARCH_STATE, state: { aWhole: 'newState' } }).searchState).toEqual({ aWhole: 'newState' });
    expect(reducer(initialState, { type: AppConstants.SET_SEARCH_STATE, state: undefined }).searchState).toEqual(undefined);
  });
  it('should handle SET_OFFLINE_THRESHOLD', async () => {
    expect(reducer(undefined, { type: AppConstants.SET_OFFLINE_THRESHOLD, value: 'something' }).offlineThreshold).toEqual('something');
    expect(reducer(initialState, { type: AppConstants.SET_OFFLINE_THRESHOLD, value: undefined }).offlineThreshold).toEqual(undefined);
  });

  it('should handle SET_VERSION_INFORMATION', async () => {
    expect(reducer(undefined, { type: AppConstants.SET_VERSION_INFORMATION, value: 'something' }).versionInformation).toEqual('something');
    expect(reducer(initialState, { type: AppConstants.SET_VERSION_INFORMATION, value: undefined }).versionInformation).toEqual(undefined);
    expect(reducer(undefined, { type: AppConstants.SET_VERSION_INFORMATION, docsVersion: 'something' }).docsVersion).toEqual('something');
    expect(reducer(initialState, { type: AppConstants.SET_VERSION_INFORMATION, docsVersion: undefined }).docsVersion).toEqual(undefined);
  });

  it('should handle UPLOAD_PROGRESS', async () => {
    const { uploadsById } = reducer(undefined, {
      type: AppConstants.UPLOAD_PROGRESS,
      uploads: { uploading: true, uploadProgress: 40 }
    });
    expect(uploadsById).toEqual({
      uploading: true,
      uploadProgress: 40
    });

    const { uploadsById: uploading2 } = reducer(initialState, {
      type: AppConstants.UPLOAD_PROGRESS,
      uploads: { uploading: true, uploadProgress: 40 }
    });
    expect(uploading2).toEqual({
      uploading: true,
      uploadProgress: 40
    });
  });
});
