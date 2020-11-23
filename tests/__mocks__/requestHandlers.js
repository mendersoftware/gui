import { deploymentHandlers } from './deploymentHandlers';
import { deviceHandlers } from './deviceHandlers';
import { organizationHandlers } from './organizationHandlers';
import { releaseHandlers } from './releaseHandlers';

const handlers = [...deploymentHandlers, ...deviceHandlers, ...organizationHandlers, ...releaseHandlers];

export default handlers;
