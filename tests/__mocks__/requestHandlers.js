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
import { rest } from 'msw';

import { deploymentHandlers } from './deploymentHandlers';
import { deviceHandlers } from './deviceHandlers';
import { monitorHandlers } from './monitorHandlers';
import { organizationHandlers } from './organizationHandlers';
import { releaseHandlers } from './releaseHandlers';
import { userHandlers } from './userHandlers';

const testLocation = '/test';

const baseHandlers = [
  rest.get(testLocation, (_, res, ctx) => res(ctx.status(200))),
  rest.post(testLocation, (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
  rest.put(testLocation, (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
  rest.delete(testLocation, (_, res, ctx) => res(ctx.status(200), ctx.json({})))
];

const handlers = [...baseHandlers, ...deploymentHandlers, ...deviceHandlers, ...monitorHandlers, ...organizationHandlers, ...releaseHandlers, ...userHandlers];

export default handlers;
