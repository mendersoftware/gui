import { deploymentHandlers } from './deploymentHandlers';
import { deviceHandlers } from './deviceHandlers';
import { organizationHandlers } from './organizationHandlers';
import { releaseHandlers } from './releaseHandlers';
import { userHandlers } from './userHandlers';

const handlers = [...deploymentHandlers, ...deviceHandlers, ...organizationHandlers, ...releaseHandlers, ...userHandlers];

export default handlers;
