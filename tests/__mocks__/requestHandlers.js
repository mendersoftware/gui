import { deploymentHandlers } from './deploymentHandlers';
import { deviceHandlers } from './deviceHandlers';
import { monitorHandlers } from './monitorHandlers';
import { organizationHandlers } from './organizationHandlers';
import { releaseHandlers } from './releaseHandlers';
import { userHandlers } from './userHandlers';

const handlers = [...deploymentHandlers, ...deviceHandlers, ...monitorHandlers, ...organizationHandlers, ...releaseHandlers, ...userHandlers];

export default handlers;
