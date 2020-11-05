import reducer, { initialState } from './userReducer';
import * as UserConstants from '../constants/userConstants';

const testUser = {
  created_ts: '',
  email: 'test@example.com',
  id: '123',
  roles: ['RBAC_ROLE_PERMIT_ALL'],
  tfasecret: '',
  updated_ts: ''
};

describe('user reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVED_QR_CODE', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.RECEIVED_QR_CODE,
        value: '123'
      }).qrCode
    ).toEqual('123');

    expect(
      reducer(initialState, {
        type: UserConstants.RECEIVED_QR_CODE,
        value: '123'
      }).qrCode
    ).toEqual('123');
  });

  it('should handle SUCCESSFULLY_LOGGED_IN', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.SUCCESSFULLY_LOGGED_IN,
        value: '123'
      }).jwtToken
    ).toEqual('123');

    expect(
      reducer(initialState, {
        type: UserConstants.SUCCESSFULLY_LOGGED_IN,
        value: '123'
      }).jwtToken
    ).toEqual('123');
  });

  it('should handle RECEIVED_USER_LIST', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.RECEIVED_USER_LIST,
        users: {
          '123': testUser
        }
      }).byId
    ).toEqual({
      '123': testUser
    });

    expect(
      reducer(
        {
          ...initialState,
          byId: {
            '123': testUser
          }
        },
        {
          type: UserConstants.RECEIVED_USER_LIST,
          users: {
            '456': testUser
          }
        }
      ).byId
    ).toEqual({
      '456': testUser
    });
  });

  it('should handle RECEIVED_USER', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.RECEIVED_USER,
        user: testUser
      }).byId
    ).toEqual({
      '123': testUser
    });

    expect(
      reducer(
        {
          ...initialState,
          byId: {
            '123': testUser
          }
        },
        {
          type: UserConstants.RECEIVED_USER,
          user: testUser
        }
      ).byId
    ).toEqual({
      '123': testUser
    });
  });

  it('should handle CREATED_USER', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.CREATED_USER,
        user: testUser
      }).byId
    ).toEqual({
      0: testUser
    });

    expect(
      reducer(
        {
          ...initialState,
          byId: {
            '123': testUser
          }
        },
        {
          type: UserConstants.CREATED_USER,
          user: testUser
        }
      ).byId
    ).toEqual({
      '123': testUser,
      0: testUser
    });
  });

  it('should handle REMOVED_USER', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.REMOVED_USER,
        userId: '123'
      }).byId
    ).toEqual({});

    expect(
      reducer(
        {
          ...initialState,
          byId: {
            '123': testUser,
            '456': testUser
          }
        },
        {
          type: UserConstants.REMOVED_USER,
          userId: '123'
        }
      ).byId
    ).toEqual({ '456': testUser });
  });

  it('should handle UPDATED_USER', () => {
    expect(
      reducer(undefined, {
        type: UserConstants.UPDATED_USER,
        userId: '123',
        user: testUser
      }).byId
    ).toEqual({
      '123': testUser
    });

    expect(
      reducer(
        {
          ...initialState,
          byId: {
            '123': testUser
          }
        },
        {
          type: UserConstants.UPDATED_USER,
          userId: '123',
          user: {
            ...testUser,
            email: 'test@mender.io'
          }
        }
      ).byId['123'].email
    ).toEqual('test@mender.io');
  });
});
