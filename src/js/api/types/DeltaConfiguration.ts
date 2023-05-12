/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BinaryDeltaConfiguration } from "./BinaryDeltaConfiguration";
import type { BinaryDeltaLimits } from "./BinaryDeltaLimits";

/**
 * Delta configuration options.
 */
export type DeltaConfiguration = {
  enabled?: boolean;
  binary_delta?: BinaryDeltaConfiguration;
  binary_delta_limits?: BinaryDeltaLimits;
};
