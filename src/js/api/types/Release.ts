/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Artifact } from "./Artifact";

/**
 * Groups artifacts with the same release name into a single resource.
 */
export type Release = {
  /**
   * release name.
   */
  name?: string;
  /**
   * Last modification time for the release.
   */
  modified?: string;
  /**
   * List of artifacts for this release.
   */
  artifacts?: Array<Artifact>;
  /**
   * Tags assigned to the release used for filtering releases. Each tag
   * must be valid a ASCII string and contain only lowercase and uppercase
   * letters, digits, underscores, periods and hyphens.
   */
  tags?: Array<string>;
};
