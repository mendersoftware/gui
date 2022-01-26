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
