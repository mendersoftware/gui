/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NewDeploymentPhase = {
  /**
   * Percentage of devices to update in the phase.
   * This field is optional for the last phase.
   * The last phase will contain the rest of the devices.
   * Note that if the percentage of devices entered does not
   * add up to a whole number of devices it is rounded down,
   * and in the case it is rounded down to zero, a 400 error
   * will be returned. This is mostly a concern when the deployment
   * consists of a low number of devices, like say 5 percent of 11
   * devices will round to zero, and an error is returned by the server.
   */
  batch_size?: number;
  /**
   * Start date of a phase.
   * Can be skipped for the first phase of a new deployment definition ('start immediately').
   */
  start_ts?: string;
};
