/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FilterPredicate } from "./FilterPredicate";

/**
 * Inventory filter assigned to the deployment
 */
export type FilterDeployments = {
  /**
   * Unique identifier of the saved filter.
   */
  id: string;
  /**
   * Name of the saved filter.
   */
  name: string;
  terms?: Array<FilterPredicate>;
};
