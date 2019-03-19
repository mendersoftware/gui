import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
import cookie from 'react-cookie';
import { isEmpty, decodeSessionToken, preformatWithRequestID, hashString } from '../../helpers';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import ReactTooltip from 'react-tooltip';
import { toggleHelptips, hideAnnouncement } from '../../utils/toggleuseroptions';
import { DevicesNav, ArtifactsNav, DeploymentsNav } from '../helptips/helptooltips';
import Linkify from 'react-linkify';
var DeviceNotifications = require('./devicenotifications');
var DeploymentNotifications = require('./deploymentnotifications');

var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var createReactClass = require('create-react-class');

import { Tabs, Tab } from 'material-ui/Tabs';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import InfoIcon from 'react-material-icons/icons/action/info-outline';
import AnnounceIcon from 'react-material-icons/icons/action/announcement';
import ExitIcon from 'react-material-icons/icons/action/exit-to-app';
import CloseIcon from 'react-material-icons/icons/navigation/close';


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
  }
};

var Header = createReactClass({
  getInitialState: function() {
    return {
      sessionId: cookie.load('JWT'),
      user: AppStore.getCurrentUser(),
      showHelptips: AppStore.showHelptips(),
      pendingDevices: AppStore.getTotalPendingDevices(),
      acceptedDevices: AppStore.getTotalAcceptedDevices(),
      artifacts: AppStore.getArtifactsRepo(),
      hasDeployments: AppStore.getHasDeployments(),
      multitenancy: AppStore.hasMultitenancy(),
      deviceLimit: AppStore.getDeviceLimit(),
      inProgress: AppStore.getNumberInProgress(),
      globalSettings: AppStore.getGlobalSettings(),
    };
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  componentDidUpdate: function(prevProps, prevState) {

    if (!this.state.sessionId || isEmpty(this.state.user) || (this.state.user === null) ) {
       this._updateUsername();
    } else {
      if (prevState.sessionId!==this.state.sessionId ) {
        this._hasDeployments();
        this._hasArtifacts();
        this._checkShowHelp();
        this._checkHeaderInfo();
        this._getGlobalSettings();
      }
    }
  },
  componentDidMount: function() {
    // check logged in user
    this._updateUsername();
    if (this.props.isLoggedIn) {
      this._hasDeployments();
      this._checkHeaderInfo();
      this._hasArtifacts();
      this._checkShowHelp();
      this._getGlobalSettings();
    }

  },
  _checkHeaderInfo: function() {
      this._getDeviceLimit();
      this._deploymentsInProgress();
      this._hasDevices();
      this._hasPendingDevices();
      this._checkAnnouncement();
  },
  _getGlobalSettings: function() {
    var self = this;
    var callback = {
      success: function(settings) {
        // console.log(settings);
      },
      error: function(err) {
        console.log("error", err);
      }
    };
    AppActions.getGlobalSettings(callback);
  },
  _getDeviceLimit: function() {
    var self = this;
    var callback = {
      success: function(limit) {
        self.setState({deviceLimit: 500});
      },
      error: function(err) {
        console.log(err);
      }
    }
    AppActions.getDeviceLimit(callback);
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
  _checkAnnouncement: function() {
    var hash = this.props.announcement ? hashString(this.props.announcement) : null;
    var announceCookie = cookie.load(this.state.user.id+hash);
    if (hash && typeof announceCookie === 'undefined') {
      this.setState({showAnnouncement: true, hash: hash});
    } else {
      this.setState({showAnnouncement: false});
    }
  },
  _hideAnnouncement: function() {
    hideAnnouncement(this.state.hash);
    this.setState({showAnnouncement: false});
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
  _deploymentsInProgress: function() {
    // check if deployments in progress
    var self = this;
    AppActions.getDeploymentCount("inprogress", function(count) {
      self.setState({inProgress: count});
    });
  },

  _hasDevices: function() {
    // check if any devices connected + accepted
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({acceptedDevices: count});
      },
      error: function(err) {
        console.log(err);
      }
    };

    AppActions.getDeviceCount(callback, "accepted");
  },
  _hasPendingDevices: function() {
    // check if any devices connected + accepted
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({pendingDevices: count});
      },
      error: function(err) {
        console.log(err.error);
      }
    };

    AppActions.getDeviceCount(callback, "pending");
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
          self._getGlobalSettings();
          self._checkHeaderInfo();
        },
        error: function(err) {
          self.setState({gettingUser: false});
          var errMsg = err.res.error;
          console.log(errMsg);
        }
      };

      var userId = self.state.sessionId ? decodeSessionToken(self.state.sessionId) : decodeSessionToken(cookie.load('JWT'));
      if (userId) {
        self.setState({gettingUser: true});
        AppActions.getUser(userId, callback);
      }
    }

  },
  changeTab: function() {
    this._getGlobalSettings();
    this._checkHeaderInfo();
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
    var dropdownLabel = (
      <span>
         <FontIcon className="material-icons" style={{marginRight: '8px', top: '5px', fontSize: '20px', color: '#c7c7c7'}}>account_circle</FontIcon>
         {(this.state.user || {}).email}
      </span>
    );

    var helpPath = this.context.location.pathname.indexOf("/help")!=-1;

    var dropDownElement = (

      <DropDownMenu className="header-dropdown" anchorOrigin={{vertical: 'center', horizontal: 'middle'}} targetOrigin={{vertical: 'bottom', horizontal: 'middle'}}  style={{marginRight: "0", fontSize: "14px", paddingLeft: "4px"}} iconStyle={{ fill: 'rgb(0, 0, 0)' }} value={(this.state.user || {}).email} onChange={this._handleHeaderMenu}>
        <MenuItem primaryText={dropdownLabel} value={(this.state.user || {}).email} className="hidden" />
        <MenuItem primaryText="Settings" value="/settings" />
        <MenuItem primaryText="My account" value="/settings/my-account" />
        <MenuItem primaryText="My organization" value="/settings/my-organization" className={this.state.multitenancy ? null : "hidden" } />
        <MenuItem primaryText="User management" value="/settings/user-management" />
        <MenuItem primaryText={ this.state.showHelptips ? "Hide help tooltips" : "Show help tooltips"} value="toggleHelptips" />
        <MenuItem primaryText="Help" value="/help" />
        <MenuItem primaryText="Log out" value="/login" rightIcon={<ExitIcon style={{color: "#c7c7c7", fill: "#c7c7c7"}} />} />
      </DropDownMenu>
    );
    return (
      <div className={this.context.router.isActive('/login') ? "hidden" : null}>
        <Toolbar style={{backgroundColor: "#fff"}}>
          <ToolbarGroup key={0}>
            <Link to="/" id="logo"></Link>

            {this.props.demo ? 
              <div id="demoBox">
                <a 
                  id="demo-info"
                  data-tip
                  data-for='demo-mode'
                  data-event='click focus'
                  data-offset="{'bottom': 15, 'right': 60}">
                  <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
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
                  <p><a href={"https://docs.mender.io/"+this.props.docsVersion+"/administration/production-installation"} target="_blank">See the documentation for help switching to production mode</a>.</p>
                </ReactTooltip>
              </div>
            : null }

          </ToolbarGroup>

          <ToolbarGroup key={1} style={{flexGrow: "2"}}>
            { this.props.announcement ? 
              <div id="announcement" className={this.state.showAnnouncement ? "fadeInSlow" : "fadeOutSlow"} style={{display: "flex", alignItems:"center"}}>
                <AnnounceIcon className="red" style={{marginRight:"4px", height:"18px", minWidth: "24px"}} />
                <Linkify properties={{target: '_blank'}}>{this.props.announcement}</Linkify>
                <a onClick={this._hideAnnouncement}><CloseIcon style={{marginLeft:"4px", height:"16px", verticalAlign:"bottom"}} /></a>
              </div> 
            : null }
          </ToolbarGroup>

          <ToolbarGroup style={{flexShrink: "0"}} key={2}>

            <DeviceNotifications 
              pending={this.state.pendingDevices} 
              total={this.state.acceptedDevices}
              limit={this.state.deviceLimit}
              />

            <DeploymentNotifications inprogress={this.state.inProgress} />
            {dropDownElement}
          </ToolbarGroup>
        </Toolbar>

        <div id="header-nav">

          { this.state.showHelptips && this.state.acceptedDevices && !this.state.artifacts.length && !this.context.router.isActive('/artifacts') ?
            <div>
              <div
                id="onboard-8"
                className="tooltip help highlight"
                data-tip
                data-for='artifact-nav-tip'
                data-event='click focus'
                style={{left: "150px", top:"135px"}}>
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


          { this.state.showHelptips && !this.state.acceptedDevices && !(this.state.pendingDevices && this.context.router.isActive({ pathname: '/' }, true)) && !this.context.router.isActive('/devices') && !helpPath ?
            <div>
              <div
                id="onboard-7"
                className="tooltip help highlight"
                data-tip
                data-for='devices-nav-tip'
                data-event='click focus'
                style={{left: "150px", top:"75px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="devices-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <DevicesNav devices={this.state.pendingDevices} />
              </ReactTooltip>
            </div>
          : null }

           { this.state.showHelptips && !this.state.hasDeployments && this.state.acceptedDevices && this.state.artifacts.length && !this.context.router.isActive('/deployments') ?
            <div>
              <div
                id="onboard-11"
                className="tooltip help highlight"
                data-tip
                data-for='deployments-nav-tip'
                data-event='click focus'
                style={{left: "150px", top:"196px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="deployments-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <DeploymentsNav devices={this.state.acceptedDevices} />
              </ReactTooltip>
            </div>
          : null }


          <Tabs
            value={this.props.currentTab}
            onChange={this.changeTab}
            tabItemContainerStyle={{display: "none"}}
            inkBarStyle={{display: "none"}}>
            {menu}
          </Tabs>
        </div>
      </div>
    );
  }
});

Header.contextTypes = {
  router: PropTypes.object,
  location: PropTypes.object,
};

module.exports = Header;
