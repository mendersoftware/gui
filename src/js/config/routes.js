import React from 'react';

import App from '../components/app';

import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/devices';
import Artifacts from '../components/artifacts/artifacts';


import { Router, Route, IndexRoute } from 'react-router';


module.exports = (
  <Route path="/" component={App}>
    <IndexRoute component={Dashboard} />
    <Route path="/devices" component={Devices} >
      <Route path="(:groupId)">
        <Route path="(:filters)" />
      </Route>
    </Route>
    <Route path="/artifacts" component={Artifacts}>
      <Route path="(:artifactVersion)" />
    </Route>
    <Route path="/deployments" component={Deployments}>
      <Route path="(:tab)">
        <Route path="(:params)">
          <Route path="(:Id)" />
        </Route>
      </Route>
    </Route>
  </Route>
);  