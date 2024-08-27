/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeltaConfiguration } from "./DeltaConfiguration";
/**
 * Update Tenant
 */
export type UpdateChildTenant = {
  /**
   * Name of the tenant.
   */
  name?: string;
  /**
   * Plan for the tenant, e.g.: os, professional, enterprise.
   */
  plan?: string;
  /**
   * Device limit for the tenant.
   */
  device_limit?: number;
  /**
   * List of add-ons to enable for the tenant, e.g.: troubleshoot, configure, monitor.
   */
  addons?: Array<string>;
  binary_delta?: DeltaConfiguration;
  /**
   * Enable SSO for the tenant.
   */
  sso?: boolean;
};
