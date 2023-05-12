/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeploymentAggregationTerm } from "./DeploymentAggregationTerm";
import type { DeploymentFilterTerm } from "./DeploymentFilterTerm";

export type DeploymentAggregationTerms = {
  /**
   * Aggregation terms.
   */
  aggregations?: Array<DeploymentAggregationTerm>;
  /**
   * Filtering terms.
   */
  filters?: Array<DeploymentFilterTerm>;
};
