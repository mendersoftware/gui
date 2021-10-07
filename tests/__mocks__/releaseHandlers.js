import { rest } from 'msw';

import { defaultState } from '../mockData';
import { deploymentsApiUrl } from '../../src/js/actions/releaseActions';

export const releaseHandlers = [
  rest.get(`${deploymentsApiUrl}/artifacts/:id/download`, (req, res, ctx) => res(ctx.json({ uri: 'https://testlocation.com/artifact.mender' }))),
  rest.delete(`${deploymentsApiUrl}/artifacts/:id`, ({ params: { id } }, res, ctx) => {
    if (id === defaultState.releases.byId.r1.Artifacts[0].id) {
      return res(ctx.status(200));
    }
    return res(ctx.status(591));
  }),
  rest.put(`${deploymentsApiUrl}/artifacts/:id`, ({ params: { id }, body: { description } }, res, ctx) => {
    if (id === defaultState.releases.byId.r1.Artifacts[0].id && description) {
      return res(ctx.status(200));
    }
    return res(ctx.status(592));
  }),
  rest.post(`${deploymentsApiUrl}/artifacts/generate`, (req, res, ctx) => res(ctx.status(200))),
  rest.post(`${deploymentsApiUrl}/artifacts`, (req, res, ctx) => res(ctx.status(200)))
];
