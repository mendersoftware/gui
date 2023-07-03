/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DeviceState = {
  /**
   * The desired state for the device, as reported by the cloud/user.
   */
  desired?: any;
  /**
   * State reported by the device, this cannot be changed from the cloud.
   */
  reported?: any;
};
