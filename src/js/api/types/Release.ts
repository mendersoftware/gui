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
};
