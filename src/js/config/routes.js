var React = require('react');

var App = require('../components/app');

var Dashboard = require('../components/dashboard/dashboard');
var Updates = require('../components/updates/updates');
var Devices = require('../components/devices/devices');
var Software = require('../components/software/software');


var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;

module.exports = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="dashboard" handler={Dashboard} />
    <Route name="updates" path="/updates" handler={Updates} />
    <Route name="devices" path="/devices" handler={Devices} />
    <Route name="software" path="/software" handler={Software} />
  </Route>
);  