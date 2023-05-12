/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Credentials } from "./Credentials";

export type Integration = {
  /**
   * A unique integration identifier generated by the mender server
   */
  id?: string;
  provider: Integration.provider;
  credentials: Credentials;
  /**
   * A short human readable description (max 1024 characters).
   */
  description?: string;
};

export namespace Integration {
  export enum provider {
    IOT_HUB = "iot-hub",
    IOT_CORE = "iot-core",
    WEBHOOK = "webhook",
  }
}
