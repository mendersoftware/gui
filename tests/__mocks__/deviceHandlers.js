import { rest } from 'msw';

import { defaultState } from '../mockData';
import { deviceAuthV2, inventoryApiUrl, inventoryApiUrlV2 } from '../../src/js/actions/deviceActions';
import { headerNames } from '../../src/js/api/general-api';

export const deviceHandlers = [];
