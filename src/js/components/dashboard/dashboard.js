import React from 'react';
var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Health = require('./health');
var Activity = require('./activity');
var Deployments = require('./deployments');
import { Router, Route, Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';

function getState() {
  return {
    progress: AppStore.getDeploymentsInProgress(),
    health: AppStore.getHealth(),
    devices: AppStore.getAllDevices(),
    recent: AppStore.getPastDeployments(),
    activity: AppStore.getActivity(),
    hideReview: localStorage.getItem("reviewDevices"),
    snackbar: AppStore.getSnackbar()
  }
}

/* Joyride */
var tooltips = {
  admissions: {
    title: 'Authorize devices',
    text: 'Devices must be authorized before you can deploy an update to them. <br/><br/>Click <b>Review details</b> to view the device\'s details before authorizing it.',
    selector: '#authorize',
    position: 'bottom',
    type: 'hover'
  }
};

var Dashboard = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillUnmount: function () {
    clearInterval(this.timer);
    AppStore.removeChangeListener(this._onChange);
  },
  componentDidMount: function() {
    this.timer = setInterval(this._refreshDeployments, 5000);
    this._refreshDeployments();
    this._refreshAdmissions();
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _setStorage: function(key, value) {
    AppActions.setLocalStorage(key, value);
  },
  _refreshDeployments: function() {
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
  _refreshAdmissions: function() {
    AppActions.getNumberOfDevicesForAdmission(function(count) {
      var pending = count;
      this.setState({pending: pending});
      setTimeout(function() {
        this.setState({doneAdmnsLoading:true});
        // this.props.addTooltip(tooltips.admissions);
        // this.props.makeReady(true);
      }.bind(this), 300)
    }.bind(this));
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
    if (this.state.pending) {
      if (this.state.pending > 1) {
        pending_str = 'are ' + this.state.pending + ' devices';
      } else {
        pending_str = 'is ' + this.state.pending + ' device';
      }
    }
    return (
      <div className="contentContainer dashboard">
        <div>
          <div className={this.state.pending && !this.state.hideReview ? "onboard margin-bottom" : "hidden" }>
            <div className="close" onClick={this._setStorage.bind(null, "reviewDevices", true)}/>
            <p>There {pending_str} waiting authorization</p>
            <RaisedButton onClick={this._handleClick.bind(null, {route:"devices"})} primary={true} label="Review details" />
            <div id="authorize" className={this.props.showTooltips ? "activity joyride-beacon absolute bottom" : "hidden"}>
              <span className="joyride-beacon__inner"></span>
              <span className="joyride-beacon__outer"></span>
            </div>
          </div>
          <div className="leftDashboard">
            <Deployments loadingActive={!this.state.doneActiveDepsLoading} loadingRecent={!this.state.donePastDepsLoading} clickHandle={this._handleClick} progress={this.state.progress} recent={this.state.recent} />
          </div>
          <div className="rightDashboard">
            <div className="right">
              <Health addTooltip={this.props.addTooltip} loading={!this.state.doneAdmnsLoading} devices={this.state.devices} clickHandle={this._handleClick} health={this.state.health} />
              <Activity addTooltip={this.props.addTooltip} loading={!this.state.doneActivityLoading}  activity={this.state.activity} />
            </div>
          </div>
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.object
};
 
module.exports = Dashboard;