import { deploymentHandlers } from './deploymentHandlers';
import { organizationHandlers } from './organizationHandlers';

const handlers = [...deploymentHandlers, ...organizationHandlers];

export default handlers;
