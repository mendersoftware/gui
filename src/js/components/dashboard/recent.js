import React from 'react';
var GroupDevices = require('../deployments/groupdevices');
var RecentStats = require('./recentstats');
import Time from 'react-time';
var AppActions = require('../../actions/app-actions');
var Loader = require('../common/loader');

import { Router, Route, Link } from 'react-router';

// material ui
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';

var Recent = React.createClass({
  getInitialState: function() {
    return {
      devices: {} 
    };
  },
  _clickHandle: function(id) {
    var params = {};
    params.id = id;
    params.tab = "past";
    params.route="deployments";
    params.open=true;
    this.props.clickHandle(params);
  },
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    } 
    return;
  },
  render: function() {
    var deployments = this.props.deployments || [];
    var recent = deployments.map(function(deployment, index) {
      if (index<3) {

        var last = (deployments.length === index+1) || index===4;
        var status = deployment.status === "Failed" ? "warning" : "check";
        var icon = (
          <FontIcon className="material-icons">
            {status}
          </FontIcon>
        );
        return (
          <div onClick={this._clickHandle.bind(null, deployment.id)} className="deployment" key={index}>
            <div className="deploymentInfo">
              <div><div className="progressLabel">Updating to:</div>{deployment.artifact_name}</div>
              <div><div className="progressLabel">Device group:</div>{deployment.name}</div>
              <div><div className="progressLabel">Started:</div><Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
            </div>
            <RecentStats id={deployment.id} />
          </div>
        )
      }
    }, this);
    return (
      <div>
        <div className="deployments-container">
          <div className="dashboard-header">
            <h2>Recent deployments</h2>
          </div>

          <Loader show={this.props.loading} fade={true} />

          <div className={deployments.length ? "fadeIn" : "hidden" }>
            <div className="block">
              {recent}
            </div>
            <Link to="/deployments/past" className="float-right">All past deployments</Link>
          </div> 
          
          <div className={(deployments.length || this.props.loading) ? "hidden" : "dashboard-placeholder" }>
            <p>View the results of recent deployments here</p>
            <img src="assets/img/history.png" alt="recent" />
          </div>  
        </div>
      </div>
    );
  }
});

Recent.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Recent;
