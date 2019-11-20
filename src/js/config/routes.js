import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import App from '../components/app';
import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/devices';
import Artifacts from '../components/artifacts/artifacts';
import Login from '../components/user-management/login';
import Settings from '../components/settings/settings';
import Help from '../components/help/help';

import { isLoggedIn } from '../auth';

const PrivateRoute = ({ component: Component, ...rest }) => {
  // if not logged in, redirect to login screen
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn() ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default (
  <App isLoggedIn={isLoggedIn()}>
    <Switch>
      <PrivateRoute exact path="/" component={Dashboard} />
      <PrivateRoute path="/devices/:status(pending|preauthorized|rejected)?/:filters?" component={Devices} />
      <PrivateRoute path="/releases/:artifactVersion?" component={Artifacts} />
      <PrivateRoute path="/deployments/:tab?" component={Deployments} />
      <PrivateRoute path="/settings/:section?" component={Settings} />
      <PrivateRoute path="/help" component={Help} />
      <Route path="/login" render={() => <Login />} />
      <PrivateRoute component={Dashboard} />
    </Switch>
  </App>
);
