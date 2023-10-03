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

import { deploymentsApiUrl, deploymentsApiUrlV2 } from '../../src/js/actions/deploymentActions';
import { headerNames } from '../../src/js/api/general-api';
import { SORTING_OPTIONS } from '../../src/js/constants/appConstants';
import { customSort } from '../../src/js/helpers';
import { defaultState, releasesList } from '../mockData';

export const releaseHandlers = [
  rest.get(`${deploymentsApiUrl}/artifacts/:id/download`, (req, res, ctx) => res(ctx.json({ uri: 'https://testlocation.com/artifact.mender' }))),
  rest.delete(`${deploymentsApiUrl}/artifacts/:id`, ({ params: { id } }, res, ctx) => {
    if (id === defaultState.releases.byId.r1.artifacts[0].id) {
      return res(ctx.status(200));
    }
    return res(ctx.status(591));
  }),
  rest.put(`${deploymentsApiUrl}/artifacts/:id`, ({ params: { id }, body: { description } }, res, ctx) => {
    if (id === defaultState.releases.byId.r1.artifacts[0].id && description) {
      return res(ctx.status(200));
    }
    return res(ctx.status(592));
  }),
  rest.post(`${deploymentsApiUrl}/artifacts/generate`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${deploymentsApiUrl}/artifacts`, (req, res, ctx) => res(ctx.status(200))),
  rest.get(`${deploymentsApiUrlV2}/deployments/releases`, ({ url: { searchParams } }, res, ctx) => {
    const page = Number(searchParams.get('page'));
    const perPage = Number(searchParams.get('per_page'));
    if (!page || ![1, 10, 20, 50, 100, 250, 500].includes(perPage)) {
      return res(ctx.status(593));
    }
    if (searchParams.get('device_type')) {
      return res(ctx.json([]));
    }
    if (page == 42) {
      return res(ctx.set(headerNames.total, 1), ctx.json([defaultState.releases.byId.r1]));
    }
    const sort = searchParams.get('sort');
    const releaseListSection = releasesList.sort(customSort(sort.includes(SORTING_OPTIONS.desc), 'name')).slice((page - 1) * perPage, page * perPage);
    if (searchParams.get('name')) {
      return res(ctx.set(headerNames.total, 1234), ctx.json(releaseListSection));
    }
    return res(ctx.set(headerNames.total, releasesList.length), ctx.json(releaseListSection));
  }),
  rest.get(`${deploymentsApiUrlV2}/releases/all/tags`, (_, res, ctx) => res(ctx.json(['foo', 'bar']))),
  rest.get(`${deploymentsApiUrlV2}/releases/all/types`, (_, res, ctx) => res(ctx.json(['single-file', 'not-this']))),
  rest.put(`${deploymentsApiUrlV2}/deployments/releases/:name/tags`, ({ params: { name }, body: tags }, res, ctx) => {
    if (name && tags.every(i => i && i.toString() === i)) {
      return res(ctx.status(200));
    }
    return res(ctx.status(593));
  }),
  rest.patch(`${deploymentsApiUrlV2}/deployments/releases/:name`, ({ params: { name }, body: { notes } }, res, ctx) => {
    if (name && notes.length) {
      return res(ctx.status(200));
    }
    return res(ctx.status(594));
  })
];
