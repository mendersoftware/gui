// Copyright 2021 Northern.tech AS
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
import { rest } from 'msw';

import { monitorApiUrlv1 } from '../../src/js/actions/monitorActions';
import { headerNames } from '../../src/js/api/general-api';
import { alertChannels } from '../../src/js/constants/monitorConstants';
import { defaultState } from '../mockData';

export const monitorHandlers = [
  rest.get(`${monitorApiUrlv1}/devices/:id/alerts`, (req, res, ctx) => {
    return res(ctx.set(headerNames.total, '1'), ctx.json([]));
  }),
  rest.get(`${monitorApiUrlv1}/devices/:id/alerts/latest`, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(`${monitorApiUrlv1}/devices/:id/config`, ({ params: { id } }, res, ctx) => {
    if (id === defaultState.devices.byId.a1.id) {
      return res(ctx.json([{ something: 'here' }]));
    }
    return res(ctx.json([]));
  }),
  rest.put(`${monitorApiUrlv1}/settings/global/channel/alerts/:channel/status`, ({ params: { channel }, body }, res, ctx) => {
    if (Object.keys(alertChannels).includes(channel) && body.hasOwnProperty('enabled')) {
      return res(ctx.status(200));
    }
    return res(ctx.status(590));
  })
];
