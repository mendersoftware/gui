/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceAggregationTerm } from "./DeviceAggregationTerm";
import type { DeviceFilterTerm } from "./DeviceFilterTerm";

export type DeviceAggregationTerms = {
  /**
   * Aggregation terms.
   */
  aggregations?: Array<DeviceAggregationTerm>;
  /**
   * Filtering terms.
   */
  filters?: Array<DeviceFilterTerm>;
};
