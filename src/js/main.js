import React from 'react';
import { Router, Route } from 'react-router';
import { render } from 'react-dom';
var routes = require('./config/routes');

import injectTapEventPlugin from 'react-tap-event-plugin';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

import createHashHistory from 'history/lib/createHashHistory';
let history = createHashHistory();

render((
  <Router history={history}>{routes}</Router>
), document.getElementById('main'))
