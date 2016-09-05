import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Health = require('./health');
var Activity = require('./activity');
var Deployments = require('./deployments');
import { Router, Route, Link } from 'react-router';

import RaisedButton from 'material-ui/RaisedButton';

function getState() {
  return {
    progress: AppStore.getDeploymentsInProgress(),
    health: AppStore.getHealth(),
    pending: AppStore.getPendingDevices(),
    devices: AppStore.getAllDevices(),
    recent: AppStore.getPastDeployments(),
    activity: AppStore.getActivity(),
    hideReview: localStorage.getItem("reviewDevices"),
  }
}

var Dashboard = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
  },
  componentDidMount: function() {
    AppActions.getDevicesForAdmission(function(devices) {
      this.setState({pending: AppStore.getPendingDevices()});
      setTimeout(function() {
        this.setState({doneAdmnsLoading:true});
      }.bind(this), 300)
    }.bind(this));
    AppActions.getPastDeployments(function() {
      setTimeout(function() {
        this.setState({doneActiveDepsLoading:true});
      }.bind(this), 300)
    }.bind(this));
    AppActions.getDeploymentsInProgress(function() {
      setTimeout(function() {
        this.setState({donePastDepsLoading:true});
      }.bind(this), 300)
    }.bind(this));
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _setStorage: function(key, value) {
    AppActions.setLocalStorage(key, value);
  },
  _handleClick: function(params) {
    switch(params.route){
      case "deployments":
        var tab = (params.tab || "progress") + "/";
        var URIParams = "open="+params.open;
        URIParams = params.id ? URIParams + "&id="+params.id : URIParams;
        URIParams = encodeURIComponent(URIParams);
        this.context.router.push('/deployments/'+tab +URIParams);
        break;
      case "devices":
        var filters = params.status ? encodeURIComponent("status="+params.status) : '';
        this.context.router.push('/devices/'+filters);
        break;
    }
  },
  render: function() {
    var pending_str = '';
    if (this.state.pending.length) {
      if (this.state.pending.length > 1) {
        pending_str = 'are ' + this.state.pending.length + ' devices';
      } else {
        pending_str = 'is ' + this.state.pending.length + ' device';
      }
    }
    return (
      <div className="contentContainer dashboard">
        <div>
          <div className={this.state.pending.length && !this.state.hideReview ? "authorize onboard margin-bottom" : "hidden" }>
            <div className="close" onClick={this._setStorage.bind(null, "reviewDevices", true)}/>
            <p>There {pending_str} waiting authorization</p>
            <RaisedButton onClick={this._handleClick.bind(null, {route:"devices"})} primary={true} label="Review details" />
          </div>
          <div className="leftDashboard">
            <Deployments loadingActive={!this.state.doneActiveDepsLoading} loadingRecent={!this.state.donePastDepsLoading} clickHandle={this._handleClick} progress={this.state.progress} recent={this.state.recent} />
          </div>
          <div className="rightDashboard">
            <div className="right">
              <Health loading={!this.state.doneAdmnsLoading}  devices={this.state.devices} clickHandle={this._handleClick} health={this.state.health} />
              <Activity loading={!this.state.doneActivityLoading}  activity={this.state.activity} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.object
};
 
module.exports = Dashboard;