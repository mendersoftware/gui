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
import { AppContext } from '../contexts/app-context';

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
    <AppContext.Consumer>
      {({ docsVersion, artifactProgress, version }) => (
        <Switch>
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute path="/devices/:status(pending|preauthorized|rejected)?/:filters?" component={Devices} />
          <PrivateRoute path="/releases/:artifactVersion?" component={Artifacts} artifactProgress={artifactProgress} />
          <PrivateRoute path="/deployments/:tab?/:params?/:Id?" component={Deployments} docsVersion={docsVersion} />
          <PrivateRoute path="/settings/:section?" component={Settings} />
          <PrivateRoute path="/help" component={Help} docsVersion={docsVersion} version={version} />
          <Route path="/login" component={Login} />
          <PrivateRoute component={Dashboard} />
        </Switch>
      )}
    </AppContext.Consumer>
  </App>
);
