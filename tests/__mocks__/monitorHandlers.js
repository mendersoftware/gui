import { rest } from 'msw';

import { monitorApiUrlv1 } from '../../src/js/actions/monitorActions';
import { alertChannels } from '../../src/js/constants/monitorConstants';

export const monitorHandlers = [
  rest.get(`${monitorApiUrlv1}/devices/:id/alerts`, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(`${monitorApiUrlv1}/devices/:id/alerts/latest`, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.put(`${monitorApiUrlv1}/settings/global/channel/alerts/:channel/status`, ({ params: { channel }, body }, res, ctx) => {
    if (Object.keys(alertChannels).includes(channel) && body.hasOwnProperty('enabled')) {
      return res(ctx.status(200));
    }
    return res(ctx.status(590));
  })
];
