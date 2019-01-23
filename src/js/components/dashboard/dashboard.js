import React from 'react';
import PropTypes from 'prop-types';

var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Deployments = require('./deployments');
import { Devices } from './devices';
var createReactClass = require('create-react-class');
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

function getState() {
  return {
    progress: AppStore.getDeploymentsInProgress(),
    recent: AppStore.getPastDeployments(),
    activity: AppStore.getActivity(),
    refreshDeploymentsLength: 30000,
    showHelptips: AppStore.showHelptips()
  };
}

var Dashboard = createReactClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentWillUnmount: function () {
    clearInterval(this.timer);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange);
  },
  componentDidMount: function() {
    var self = this;
    clearAllRetryTimers();
    self.timer = setInterval( function() {
      self._refreshDeployments();
      self._refreshAdmissions();
    }, self.state.refreshDeploymentsLength);
    self._refreshDeployments();
    self._refreshAdmissions();
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _refreshDeployments: function() {
    var self = this;

    var pastCallback = {
      success: function () {
        setTimeout(function() {
          self.setState({doneActiveDepsLoading:true});
        }, 300)
      },
      error: function (err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    }
    AppActions.getPastDeployments(pastCallback, 1, 3);

    var progressCallback = {
      success: function () {
        setTimeout(function() {
          self.setState({donePastDepsLoading:true});
        }, 300)
      },
      error: function (err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    };


    AppActions.getDeploymentCount("inprogress", function(count) {
      // this updates header bar
      self.setState({progressCount: count});
    });
    AppActions.getDeploymentsInProgress(progressCallback);
  },
  _refreshAdmissions: function() {
    var self = this;

    var callback = {
      success: function(count) {
        self.setState({pending: count, doneAdmnsLoading:true});
      },
      error: function(err) {
        console.log(err);
      }
    };

    AppActions.getDeviceCount(callback, "pending");
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
        this.context.router.push('/devices/groups/'+filters);
        break;
      case "devices/pending":
        this.context.router.push('/devices/pending');
        break;
      default:
        this.context.router.push(params.route);
    }
  },

  _handleStopProp: function(e) {
    e.stopPropagation();
  },

  render: function() {
    return (
      <div className="dashboard">
        <Devices
          showHelptips={this.state.showHelptips}
          clickHandle={this._handleClick} />
        <Deployments
          globalSettings={this.props.globalSettings}
          loadingActive={!this.state.doneActiveDepsLoading}
          loadingRecent={!this.state.donePastDepsLoading}
          clickHandle={this._handleClick}
          progress={this.state.progress}
          recent={this.state.recent}
        />
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: PropTypes.object
};

module.exports = Dashboard;
