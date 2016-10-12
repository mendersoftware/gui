import React from 'react';
import { Router, Route, Link } from 'react-router';

var ProgressChart = require('../deployments/progressChart.js');
import Time from 'react-time';
var Loader = require('../common/loader');

// material ui
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';


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
    params.tab = "progress";
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
    var progress = deployments.map(function(deployment, index) {
      var progressChart = (
        <ProgressChart deployment={deployment} index={index} />
      );

      var deploymentInfo = (
        <div className="deploymentInfo" style={{width:"240px", height:"auto"}}>
          <div><div className="progressLabel">Updating to:</div>{deployment.artifact_name}</div>
          <div><div className="progressLabel">Device group:</div>{deployment.name}</div>
          <div><div className="progressLabel">Started:</div><Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
          <div style={{marginTop:"15px"}}><div className="progressLabel"></div><a onClick={this._clickHandle.bind(null, deployment.id)}>View report</a></div>
        </div>
      );

      var last = (deployments.length === index+1) || index===4;

      return (
        <div className="deployment" key={index}>
          <ListItem
            disabled={true}
            style={{minHeight:"100px", paddingLeft:"280px", paddingBottom: "15px"}}
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
        <div className={deployments.length ? "fadeIn" : "hidden"}>
          <List style={{paddingTop:"0"}}>
            {progress}
          </List> 
          <Link to="/deployments/progress" className="float-right">All deployments in progress</Link>
        </div>

        <Loader show={this.props.loading} fade={true} />

        <div className={(deployments.length || this.props.loading) ? "hidden" : "dashboard-placeholder" }>
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