/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuthSet } from "./AuthSet";
import type { IdentityData } from "./IdentityData";

export type DeviceDeviceauth = {
  /**
   * Mender assigned Device ID.
   */
  id?: string;
  identity_data?: IdentityData;
  status?: DeviceDeviceauth.status;
  /**
   * Created timestamp
   */
  created_ts?: string;
  /**
   * Updated timestamp
   */
  updated_ts?: string;
  auth_sets?: Array<AuthSet>;
  /**
   * Devices that are part of ongoing decommissioning process will return True
   */
  decommissioning?: boolean;
};

export namespace DeviceDeviceauth {
  export enum status {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    PREAUTHORIZED = "preauthorized",
    NOAUTH = "noauth",
  }
}
