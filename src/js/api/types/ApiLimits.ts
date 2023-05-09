/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiBurst } from "./ApiBurst";
import type { ApiQuota } from "./ApiQuota";

/**
 * Usage quota and burst limit definitions for an API type.
 */
export type ApiLimits = {
  /**
   * Collection of api burst limit definitions over specified API resources.
   */
  bursts?: Array<ApiBurst>;
  quota?: ApiQuota;
};
