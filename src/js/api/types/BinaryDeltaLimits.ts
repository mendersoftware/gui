/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Limit } from "./Limit";
import type { XDeltaArgsLimits } from "./XDeltaArgsLimits";

/**
 * The mender-binary-delta-generator configuration limits.
 */
export type BinaryDeltaLimits = {
  xdelta_args_limits?: XDeltaArgsLimits;
  timeout?: Limit;
  jobs_in_parallel?: Limit;
  queue_length?: Limit;
};
