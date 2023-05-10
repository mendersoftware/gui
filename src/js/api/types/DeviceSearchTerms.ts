/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceAttributeProjection } from "./DeviceAttributeProjection";
import type { DeviceFilterTerm } from "./DeviceFilterTerm";
import type { DeviceSortTerm } from "./DeviceSortTerm";

export type DeviceSearchTerms = {
  /**
   * Pagination parameter for iterating search results.
   */
  page?: number;
  /**
   * Number of devices returned per page.
   */
  per_page?: number;
  /**
   * Filtering terms.
   */
  filters?: Array<DeviceFilterTerm>;
  /**
   * Attribute keys to sort by.
   */
  sort?: Array<DeviceSortTerm>;
  /**
   * Restrict the attribute result to the selected attributes.
   */
  attributes?: Array<DeviceAttributeProjection>;
  /**
   * Restrict the result to the given device IDs.
   */
  device_ids?: Array<string>;
};
