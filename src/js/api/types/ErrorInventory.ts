/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Error descriptor.
 */
export type ErrorInventory = {
  /**
   * Description of the error.
   */
  error?: string;
  /**
   * Request ID (same as in X-MEN-RequestID header).
   */
  request_id?: string;
};
