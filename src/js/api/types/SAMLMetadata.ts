/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Metadata structure.
 */
export type SAMLMetadata = {
  /**
   * Metadata Id.
   */
  id: string;
  /**
   * Metadata Issuer.
   */
  issuer: string;
  /**
   * Date after which the data is not valid.
   */
  valid_until: string;
};
