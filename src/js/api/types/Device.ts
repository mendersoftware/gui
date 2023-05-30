/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Device descriptor.
 */
export type Device = {
  /**
   * Device ID.
   */
  id?: string;
  /**
   * Vendor-specific JSON representation of the device identity data (MACs, serial numbers, etc.).
   */
  identity_data: string;
};
