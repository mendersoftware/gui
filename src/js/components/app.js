import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
import Header from './header/header';
import LeftNav from './leftnav';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RawTheme from '../themes/mender-theme.js';

import IdleTimer from 'react-idle-timer';
import { clearAllRetryTimers } from '../utils/retrytimer';

import { logout, updateMaxAge, expirySet }from '../auth';

var AppStore = require('../stores/app-store');
var AppActions = require('../actions/app-actions');

var createReactClass = require('create-react-class');
var isDemoMode = false;

var App = createReactClass({
  childContextTypes: {
    location: PropTypes.object,
    muiTheme: PropTypes.object
  },
  getChildContext() { 
    var theme = getMuiTheme(RawTheme);
    return {
      muiTheme: theme,
      location: this.props.location
    };
  },
  getInitialState: function() {
    return {
      currentUser: AppStore.getCurrentUser(),
      uploadInProgress: AppStore.getUploadInProgress(),
      timeout: 900000, // 15 minutes idle time,
      currentTab: this._updateActive(),
      version: AppStore.getMenderVersion(),
      docsVersion: AppStore.getDocsVersion(),
    }
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    window.addEventListener('mousemove', updateMaxAge, false);
  },
  componentWillUnmount: function() {
    window.addEventListener('mousemove', updateMaxAge, false);
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _onIdle: function() {
    if (expirySet()) {
      // logout user and warn
      if (this.state.currentUser && !this.state.uploadInProgress) {
        logout();
        AppActions.setSnackbar("Your session has expired. You have been automatically logged out due to inactivity.");
      } else if (this.state.currentUser && this.state.uploadInProgress) {
        updateMaxAge();
      }
    }
  },
  _changeTab: function(tab) {
    this.context.router.push(tab);
    this.setState({currentTab: this._updateActive()});
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '/' :
      this.context.router.isActive('/devices') ? '/devices' :
      this.context.router.isActive('/artifacts') ? '/artifacts' :
      this.context.router.isActive('/deployments') ? '/deployments' :
      this.context.router.isActive('/help') ? '/help' :
      this.context.router.isActive('/settings') ? '/settings' : '';
  },

  render: function() {
    return (
      <IdleTimer
        ref="idleTimer"
        element={document}
        idleAction={this._onIdle}
        timeout={this.state.timeout}
        format="MM-DD-YYYY HH:MM:ss.SSS">

        <div>
          <div className="header" id="fixedHeader">
            <Header docsVersion={this.state.docsVersion} currentTab={this.state.currentTab} demo={isDemoMode} history={this.props.history} isLoggedIn={(this.state.currentUser||{}).hasOwnProperty("email")} />
          </div>

          <div className="wrapper">
            <div className="leftFixed leftNav">
              <LeftNav version={this.state.version} currentTab={this.state.currentTab} changeTab={this._changeTab} />
            </div>
            <div className="rightFluid container">
              {React.cloneElement(this.props.children, { isLoggedIn:(this.state.currentUser||{}).hasOwnProperty("email"), docsVersion: this.state.docsVersion, version: this.state.version })}
            </div>
          </div>
        </div>
      </IdleTimer>
    )
  }
});

App.contextTypes = {
  router: PropTypes.object,
  location: PropTypes.object,
};


module.exports = App;
