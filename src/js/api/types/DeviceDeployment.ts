/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Deployment } from "./Deployment";
import type { DeviceWithImage } from "./DeviceWithImage";

export type DeviceDeployment = {
  id?: string;
  deployment: Deployment;
  device: DeviceWithImage;
};
