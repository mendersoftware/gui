import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Health = require('./health');
var Activity = require('./activity');
var Deployments = require('./deployments');
import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    progress: AppStore.getProgressDeployments(new Date()),
    health: AppStore.getHealth(),
    unauthorized: AppStore.getUnauthorized(),
    recent: AppStore.getRecentDeployments(new Date()),
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
     AppActions.getDeployments();
     //AppActions.getUnauthorized();
  },
  _onChange: function() {
    this.setState(getState());
  },
  _setStorage: function(key, value) {
    AppActions.setLocalStorage(key, value);
  },
  _handleClick: function(params) {
    switch(params.route){
      case "deployments":
        var URIParams = "open="+params.open;
        URIParams = params.id ? URIParams + "&id="+params.id : URIParams;
        URIParams = encodeURIComponent(URIParams);
        //this.context.router.transitionTo("/deployments/:tab/:params/", {tab:0, params:URIParams}, null);
        this.context.router.push('/deployments/0/'+URIParams);
        break;
      case "devices":
        var filters = params.status ? encodeURIComponent("status="+params.status) : '';
        //this.context.router.transitionTo("/devices/:groupId/:filters", {groupId:1, filters: filters}, null);
        this.context.router.push('/devices/1/'+filters);
        break;
    }
  },
  render: function() {
    return (
      <div className="contentContainer">
        <div>
          <div className="leftDashboard">
            <Health closeHandle={this._setStorage} hideReview={this.state.hideReview} clickHandle={this._handleClick} health={this.state.health} unauthorized={this.state.unauthorized} />
            <Deployments clickHandle={this._handleClick} progress={this.state.progress} recent={this.state.recent} />
          </div>
          <Activity activity={this.state.activity} />
        </div>
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.object
};
 
module.exports = Dashboard;