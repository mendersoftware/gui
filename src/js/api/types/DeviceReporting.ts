/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceAttribute } from "./DeviceAttribute";

export type DeviceReporting = {
  /**
   * Device ID.
   */
  id?: string;
  attributes?: Array<DeviceAttribute>;
  /**
   * Timestamp of the last update to the device attributes.
   */
  updated_ts?: string;
};
