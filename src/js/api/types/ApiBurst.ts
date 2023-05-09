/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * API burst limit definition.
 */
export type ApiBurst = {
  /**
   * HTTP verb.
   */
  action?: string;
  /**
   * URI of the resource subject to the limit.
   */
  uri?: string;
  /**
   * Minimum allowed interval, in seconds, between subsequent calls to 'action' on 'uri' (10 = one call every 10 seconds, etc.)
   */
  min_interval_sec?: number;
};
