import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { ReviewDevices } from '../helptips/helptooltips';

var AppStore = require('../../stores/app-store');
var LocalStore = require('../../stores/local-store');
var AppActions = require('../../actions/app-actions');
var Deployments = require('./deployments');
var createReactClass = require('create-react-class');
import { Router, Route, Link } from 'react-router';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import FontIcon from 'material-ui/FontIcon';

function getState() {
  return {
    progress: AppStore.getDeploymentsInProgress(),
    devices: AppStore.getAllDevices(),
    recent: AppStore.getPastDeployments(),
    activity: AppStore.getActivity(),
    snackbar: AppStore.getSnackbar(),
    refreshDeploymentsLength: 10000,
    showHelptips: AppStore.showHelptips()
  }
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
        this.context.router.push('/devices/'+filters);
        break;
      case "devices/pending":
        this.context.router.push('/devices/pending');
        break;
    }
  },

  _handleStopProp: function(e) {
    e.stopPropagation();
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
          <div className={this.state.pending ? "onboard margin-bottom" : "hidden" }>
            <p>There {pending_str} waiting authorization</p>
            <div className="relative">
              <RaisedButton
                onClick={this._handleClick.bind(null, {route:"devices/pending"})}
                primary={true}
                label="Review details"
              />

              { this.state.showHelptips ?
                <div>
                  <div 
                    id="onboard-1"
                    className="tooltip help highlight"
                    data-tip
                    data-for='review-details-tip'
                    data-event='click focus'>
                    <FontIcon className="material-icons">help</FontIcon>
                  </div>
                  <ReactTooltip
                    id="review-details-tip"
                    globalEventOff='click'
                    place="bottom"
                    type="light"
                    effect="solid"
                    className="react-tooltip">
                    <ReviewDevices devices={this.state.pending} />
                  </ReactTooltip>
                </div>
              : null }
            </div>
           

          </div>
        </div>
        <div className="leftDashboard">
          <Deployments loadingActive={!this.state.doneActiveDepsLoading} loadingRecent={!this.state.donePastDepsLoading} clickHandle={this._handleClick} progress={this.state.progress} recent={this.state.recent} />
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          bodyStyle={{maxWidth: this.state.snackbar.maxWidth}}
          autoHideDuration={8000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: PropTypes.object
};
 
module.exports = Dashboard;
