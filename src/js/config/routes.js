import React from 'react';

import App from '../components/app';

import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/devices';
import Artifacts from '../components/artifacts/artifacts';
import Login from '../components/user-management/login';

import auth from '../auth';

import { Router, Route, IndexRoute } from 'react-router';

function requireAuth(nextState, replace) {
  // if not logged in, redirect to login screen
  if (!auth.isLoggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname, loggedIn: false }
    })
  }
}

function noRequireAuth(nextState, replace) {
  // if logged in, don't allow to show login screen
  if (auth.isLoggedIn()) {
    replace({
      pathname: '/',
      state: { nextPathname: nextState.location.pathname, loggedIn: auth.isLoggedIn() }
    })
  }
}

module.exports = (
  <Route path="/" component={App}>
    <IndexRoute component={Dashboard} onEnter={requireAuth} />
    <Route path="/devices" component={Devices} onEnter={requireAuth} >
      <Route path="(:groupId)">
        <Route path="(:filters)" />
      </Route>
    </Route>
    <Route path="/artifacts" component={Artifacts} onEnter={requireAuth}>
      <Route path="(:artifactVersion)" />
    </Route>
    <Route path="/deployments" component={Deployments} onEnter={requireAuth}>
      <Route path="(:tab)">
        <Route path="(:params)">
          <Route path="(:Id)" />
        </Route>
      </Route>
    </Route>
    <Route path="/login" component={Login} onEnter={noRequireAuth} />
  </Route>
);  