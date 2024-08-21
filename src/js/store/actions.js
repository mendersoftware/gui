import { actions as appActions } from './appSlice';
import { actions as deploymentActions } from './deploymentsSlice';
import { actions as devicesActions } from './devicesSlice';
import { actions as monitorActions } from './monitorSlice';
import { actions as onboardingActions } from './onboardingSlice';
import { actions as organizationActions } from './organizationSlice';
import { actions as releaseActions } from './releasesSlice';
import { actions as userActions } from './usersSlice';

export default {
  ...appActions,
  ...deploymentActions,
  ...devicesActions,
  ...monitorActions,
  ...onboardingActions,
  ...organizationActions,
  ...releaseActions,
  ...userActions
};
