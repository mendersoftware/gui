/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * User descriptor.
 */
export type UserUseradm = {
  /**
   * A unique email address.
   */
  email: string;
  /**
   * User Id.
   */
  id: string;
  /**
   * Server-side timestamp of the user creation.
   */
  created_ts?: string;
  /**
   * Server-side timestamp of the last user information update.
   */
  updated_ts?: string;
  /**
   * Timestamp of last successful login.
   */
  login_ts?: string;
  /**
   * Indicates if the user's email address has been verified.
   */
  verified?: boolean;
  /**
   * User Two Factor Authentication status.
   */
  tfa_status?: string;
  /**
   * List of user roles.
   */
  roles?: Array<string>;
};
