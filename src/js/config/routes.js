import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Artifacts from '../components/artifacts/artifacts';
import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/devices';
import Help from '../components/help/help';
import Settings from '../components/settings/settings';
import Login from '../components/user-management/login';
import Password from '../components/user-management/password';
import PasswordReset from '../components/user-management/passwordreset';
import Signup from '../components/user-management/signup';
import AuditLogs from '../components/auditlogs/auditlogs';

export const privateRoutes = (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    <Route path="/auditlog/:filters?" component={AuditLogs} />
    <Route path="/devices/:status(pending|preauthorized|rejected)?/:filters?" component={Devices} />
    <Route path="/releases/:artifactVersion?" component={Artifacts} />
    <Route path="/deployments/:tab(active|scheduled|finished)?" component={Deployments} />
    <Route path="/settings/:section?" component={Settings} />
    <Route path="/help" component={Help} />
    <Route component={Dashboard} />
  </Switch>
);

export const publicRoutes = (
  <Switch>
    <Route path="/login" component={Login} />
    <Route exact path="/password" component={Password} />
    <Route exact path="/password/:secretHash" component={PasswordReset} />
    <Route path="/signup/:campaign?" component={Signup} />
    <Route component={Login} />
  </Switch>
);
