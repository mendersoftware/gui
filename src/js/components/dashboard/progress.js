import React from 'react';
import { Router, Route, Link } from 'react-router';

var ProgressChart = require('../deployments/progressChart.js');
var Time = require('react-time');

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;


var Progress = React.createClass({
  getInitialState: function() {
    return {
      devices: {},
      selectedDevice: {},
    };
  },
  _clickHandle: function(id) {
    var params = {};
    params.id = id;
    params.route="deployments";
    params.open=true;
    this.props.clickHandle(params);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    var progress = this.props.deployments.map(function(deployment, index) {
      var progressChart = (
        <ProgressChart deployment={deployment} index={index} />
      );

      var deploymentInfo = (
        <div className="deploymentInfo" style={{width:"240", height:"auto"}}>
          <div><div className="progressLabel">Updating to:</div>{deployment.artifact_name}</div>
          <div><div className="progressLabel">Device group:</div><span className="capitalized">{deployment.name}</span></div>
          <div><div className="progressLabel">Started:</div><Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
          <div style={{marginTop:15}}><div className="progressLabel"></div><a onClick={this._clickHandle.bind(null, deployment.id)}>View report</a></div>
        </div>
      );

      var last = (this.props.deployments.length === index+1) || index===4;

      return (
        <div className="deployment" key={index}>
          <ListItem
            disabled={true}
            style={{minHeight:"100", paddingLeft:"280", paddingBottom: "15"}}
            primaryText={progressChart}
            leftIcon={deploymentInfo} />
        </div>
      );
    }, this);

    return (
      <div className="progress-container">
        <div className="dashboard-header">
          <h2>Deployments in progress</h2>
        </div>
        <div className={this.props.deployments.length ? null : "hidden"}>
          <List style={{paddingTop:0}}>
            {progress}
          </List> 
          <Link to="/deployments" className="float-right">All deployments</Link>
        </div>

        <div className={this.props.deployments.length ? "hidden" : "dashboard-placeholder" }>
          <p>Monitor ongoing deployments from here</p>
          <img src="assets/img/deployments.png" alt="deployments" />
        </div>
      </div>
    );
  }
});

Progress.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Progress;