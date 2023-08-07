// Copyright 2020 Northern.tech AS
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
//    limitations under the License.
import { constants } from '../store';
import { apiUrl } from '../api/general-api';

const { EXTERNAL_PROVIDER } = constants;

export const auditLogsApiUrl = `${apiUrl.v1}/auditlogs`;
export const tenantadmApiUrlv1 = `${apiUrl.v1}/tenantadm`;
export const tenantadmApiUrlv2 = `${apiUrl.v2}/tenantadm`;
export const samlIdpApiUrlv1 = `${apiUrl.v1}/useradm/sso/idp/metadata`;

export const AUDIT_LOGS_TYPES = [
  { title: 'Artifact', queryParameter: 'object_type', value: 'artifact' },
  { title: 'Deployment', queryParameter: 'object_deployment_name', value: 'deployment' },
  { title: 'Device', queryParameter: 'object_id', value: 'device' },
  { title: 'User', queryParameter: 'object_id', value: 'user' }
];
export const emptyWebhook = {
  description: '',
  enabled: true,
  credentials: {
    type: EXTERNAL_PROVIDER.webhook.credentialsType,
    [EXTERNAL_PROVIDER.webhook.credentialsType]: {
      secret: '',
      url: ''
    }
  }
};
