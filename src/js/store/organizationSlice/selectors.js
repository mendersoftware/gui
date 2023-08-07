// Copyright 2023 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and

import { createSelector } from '@reduxjs/toolkit';
import { EXTERNAL_PROVIDER } from '../commonConstants';

//    limitations under the License.
export const getOrganization = state => state.organization.organization;
export const getExternalIntegrations = state => state.organization.externalDeviceIntegrations;
export const getAuditlogState = state => state.organization.auditlog.selectionState;

export const getDeviceTwinIntegrations = createSelector([getExternalIntegrations], integrations =>
  integrations.filter(integration => integration.id && EXTERNAL_PROVIDER[integration.provider]?.deviceTwin)
);
