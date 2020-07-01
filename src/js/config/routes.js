import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Artifacts from '../components/artifacts/artifacts';
import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/devices';
import Help from '../components/help/help';
import Settings from '../components/settings/settings';
import Login from '../components/user-management/login';
import Signup from '../components/user-management/signup';

export const privateRoutes = (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    <Route path="/devices/:status(pending|preauthorized|rejected)?/:filters?" component={Devices} />
    <Route path="/releases/:artifactVersion?" component={Artifacts} />
    <Route path="/deployments/:tab?" component={Deployments} />
    <Route path="/settings/:section?" component={Settings} />
    <Route path="/help" component={Help} />
    <Route component={Dashboard} />
  </Switch>
);

export const publicRoutes = (
  <Switch>
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route component={Login} />
  </Switch>
);
