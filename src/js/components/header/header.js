import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
import cookie from 'react-cookie';
import { decodeSessionToken } from '../../helpers';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import ReactTooltip from 'react-tooltip';
import { toggleHelptips } from '../../utils/togglehelptips';
import { DevicesNav, ArtifactsNav, DeploymentsNav } from '../helptips/helptooltips';
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

import { Tabs, Tab } from 'material-ui/Tabs';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import InfoIcon from 'react-material-icons/icons/action/info-outline';


var menuItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/artifacts", text:"Artifacts"},
  {route:"/deployments", text:"Deployments"},
];

var styles = {
  tabs: {
    backgroundColor: "#f7f7f7",
    color: "#414141"
  },
  inkbar: {
    backgroundColor: "#7D3F69",
    marginTop: "0"
  }
};

var Header = createReactClass({
  getInitialState: function() {
    return {
      tabIndex: this._updateActive(),
      sessionId: cookie.load('JWT'),
      user: AppStore.getCurrentUser(),
      showHelptips: AppStore.showHelptips(),
      totalDevices: AppStore.getTotalDevices(),
      pendingDevices: AppStore.getPendingDevices(),
      artifacts: AppStore.getArtifactsRepo(),
      hasDeployments: AppStore.getHasDeployments(),
      multitenancy: AppStore.hasMultitenancy(),
    };
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive()});
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (!this.state.sessionId) {
       this._updateUsername();
    } else {
      if (prevState.sessionId!==this.state.sessionId ) {
        this._hasDeployments();
        this._hasDevices();
        this._hasArtifacts();
        this._checkShowHelp();
      }
    }
  },
  componentDidMount: function() {
    // check logged in user
    this._updateUsername();
    if (this.props.isLoggedIn) {
      this._hasDeployments();
      this._hasDevices();
      this._hasArtifacts();
      this._checkShowHelp();
    }
      
  },
  _checkShowHelp: function() {
    //checks if user id is set and if cookie for helptips exists for that user
    var userCookie = cookie.load(this.state.user.id);
    // if no user cookie set, do so via togglehelptips
    if (typeof userCookie === 'undefined' || typeof userCookie.help === 'undefined') {
       toggleHelptips();
    } else {
      // got user cookie but help value not set
      AppActions.setShowHelptips(userCookie.help);
    }
  },
  _hasDeployments: function() {
    // check if *any* deployment exists, for onboarding help tips
    var self = this;
    var callback = {
      success: function(data) {
        self.setState({hasDeployments: data.length});
      },
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.getDeployments(callback, 1, 1);
  },
  _hasDevices: function() {
    // check if *any* devices connected, for onboarding help tips
    var self = this;
    AppActions.getNumberOfDevices(function(count) {
       self.setState({totalDevices: count});
    });
  },
  _hasArtifacts: function() {
    var self = this;
    var callback = {
      success: function(artifacts) {
        self.setState({artifacts:artifacts});
      },
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.getArtifacts(callback);
  },
  _updateUsername: function() {
    var self = this;
  
    // get current user
    if (!self.state.gettingUser) {
      var callback = {
        success: function(user) {
          AppActions.setCurrentUser(user);
          self.setState({user: user, gettingUser: false});
          self._checkShowHelp();
        },
        error: function(err) {
          AppStore.setSnackbar("Can't get user details");
          self.setState({gettingUser: false});
        }
      };

      var userId = self.state.sessionId ? decodeSessionToken(self.state.sessionId) : decodeSessionToken(cookie.load('JWT'));
      if (userId) {
        self.setState({gettingUser: true});
        AppActions.getUser(userId, callback);
      }
    }
  
  },
  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/' }, true) ? '/' :
      this.context.router.isActive('/devices') ? '/devices' :
      this.context.router.isActive('/artifacts') ? '/artifacts' : 
      this.context.router.isActive('/deployments') ? '/deployments' :
      this.context.router.isActive('/settings') ? '/settings' : '/';
  },
  _handleTabActive: function(tab) {
    this.context.router.push(tab.props.value);
  },
  changeTab: function() {
    // if onboarding
    this._hasDeployments();
    // end if
    AppActions.setSnackbar("");
  },
  _handleHeaderMenu: function(event, index, value) {
    if (value === "toggleHelptips") {
      toggleHelptips();
    } else {
      if (value==="/login") {
        this.setState({gettingUser: false});
        clearAllRetryTimers();
        cookie.remove('JWT');
      }
      this.context.router.push(value);
    }
  },
  render: function() {
    var tabHandler = this._handleTabActive;
    var menu = menuItems.map(function(item, index) {
      return (
        <Tab key={index}
          style={styles.tabs}
          label={item.text}
          value={item.route}
          onActive={tabHandler} />
      )
    });
    var dropDownElement = (

      <DropDownMenu anchorOrigin={{vertical: 'center', horizontal: 'middle'}} targetOrigin={{vertical: 'bottom', horizontal: 'middle'}}  style={{marginRight: "0"}} iconStyle={{ fill: 'rgb(0, 0, 0)' }} value={(this.state.user || {}).email} onChange={this._handleHeaderMenu}>
        <MenuItem primaryText={(this.state.user || {}).email} value={(this.state.user || {}).email} className="hidden" />
        <MenuItem primaryText="My account" value="/settings/my-account" />
        <MenuItem primaryText="My organization" value="/settings/my-organization" className={this.state.multitenancy ? null : "hidden" } />
        <MenuItem primaryText="User management" value="/settings/user-management" />
        <MenuItem primaryText={ this.state.showHelptips ? "Hide help tips" : "Show help tips"} value="/settings/user-management" value="toggleHelptips" />
        <MenuItem primaryText="Log out" value="/login" />
      </DropDownMenu>
    );
    return (
      <div className={this.context.router.isActive('/login') ? "hidden" : null}>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0} className="float-left">
              <Link to="/" id="logo"></Link>


            {this.props.demo ? 
              <div id="demoBox">
                <a 
                  id="demo-info"
                  data-tip
                  data-for='demo-mode'
                  data-event='click focus'
                  data-offset="{'bottom': 15, 'right': 60}">
                  <InfoIcon style={{marginRight:"6px", height:"16px", verticalAlign:"bottom"}} />
                  Demo mode
                </a>
             
                <ReactTooltip
                  id="demo-mode"
                  globalEventOff='click'
                  place="bottom"
                  type="light"
                  effect="solid"
                  className="react-tooltip">
                  <h3>Demo mode</h3>
                  <p>Mender is currently running in <b>demo mode</b>.</p>
                  <p><a href="https://docs.mender.io/Administration/Production-installation" target="_blank">See the documentation for help switching to production mode</a>.</p>
                </ReactTooltip>
              </div>
            : null }
          </ToolbarGroup>

          <ToolbarGroup key={1} className="float-right">
            {dropDownElement}
          </ToolbarGroup>
        </Toolbar>
       
        <div id="header-nav">

          { this.state.showHelptips && this.state.totalDevices && !this.state.artifacts.length && !this.context.router.isActive('/artifacts') ?
            <div>
              <div 
                id="onboard-8"
                className="tooltip help highlight"
                data-tip
                data-for='artifact-nav-tip'
                data-event='click focus'
                style={{left: "44%", top:"40px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="artifact-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <ArtifactsNav />
              </ReactTooltip>
            </div>
          : null }



          { this.state.showHelptips && !this.state.totalDevices && this.state.pendingDevices.length && !(this.context.router.isActive('/devices') || this.context.router.isActive({ pathname: '/' }, true)) ?
            <div>
              <div 
                id="onboard-7"
                className="tooltip help highlight"
                data-tip
                data-for='devices-nav-tip'
                data-event='click focus'
                style={{left: "26%", top:"40px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="devices-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <DevicesNav devices={this.state.pendingDevices.length} />
              </ReactTooltip>
            </div>
          : null }

           { this.state.showHelptips && !this.state.hasDeployments && this.state.totalDevices && this.state.artifacts.length && !this.context.router.isActive('/deployments') ?
            <div>
              <div 
                id="onboard-11"
                className="tooltip help highlight"
                data-tip
                data-for='deployments-nav-tip'
                data-event='click focus'
                style={{left: "61%", top:"40px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="deployments-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <DeploymentsNav devices={this.state.totalDevices} />
              </ReactTooltip>
            </div>
          : null }



          <Tabs
            value={this.state.tabIndex}
            inkBarStyle={styles.inkbar}
            onChange={this.changeTab}
            tabItemContainerStyle={{backgroundColor:"inherit"}}>
            {menu}
          </Tabs>
        </div>
      </div>
    );
  }
});

Header.contextTypes = {
  router: PropTypes.object,
};

module.exports = Header;