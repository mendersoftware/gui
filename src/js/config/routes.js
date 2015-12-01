import React from 'react';

import App from '../components/app';

import Dashboard from '../components/dashboard/dashboard';
import Updates from '../components/updates/updates';
import Devices from '../components/devices/devices';
import Software from '../components/software/software';


import { Router, Route, IndexRoute } from 'react-router';


module.exports = (
  <Route path="/" component={App}>
    <IndexRoute component={Dashboard} />
    <Route path="/devices(/:groupId)(/:filters)" component={Devices} />
    <Route path="/software" component={Software} />
    <Route path="/updates(/:tab)(/:params)(/:Id)" component={Updates} />
  </Route>
);  