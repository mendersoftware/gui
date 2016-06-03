import React from 'react';
import { Router, Route, Link } from 'react-router';

var ProgressBar = require('../deployments/progressBar.js');
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
      devices: {}
    };
  },
  _clickHandle: function () {
    this.props.clickHandle(this.props.route);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  getDevices: function(data, index) {
    // retrieve number of devices from child
    var val = {};
    val[index] = "("+data+")";
    this.setState({devices: val});
  },
  render: function() {
    var progress = this.props.deployments.map(function(deployment, index) {
      var progressBar = (
        <ProgressBar deployment={deployment} getDevices={this.getDevices} index={index} />
      );

      var deploymentInfo = (
        <div className="deploymentInfo" style={{width:"260", height:"auto"}}>
          <div><div className="progressLabel">Updating to:</div>{deployment.artifact_name}</div>
          <div><div className="progressLabel">Device group:</div>{deployment.name}</div>
          <div><div className="progressLabel">Started:</div><Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
        </div>
      );

      var last = (this.props.deployments.length === index+1) || index===4;

      return (
        <div key={index}>
          <ListItem
            disabled={true}
            style={{minHeight:"100", paddingLeft:"280px"}}
            primaryText={progressBar}
            secondaryText="view report"
            onClick={this._clickHandle}
            leftIcon={deploymentInfo}
          />
          <Divider className={last ? "hidden" : null} />
        </div>
      );
   
    }, this);

    return (
      <div className="progress-container">
        <div className="dashboard-header subsection">
          <h3>In progress<span className="dashboard-number">{progress.length}</span></h3>
        </div>
        <div>
          <List>
            {progress}
          </List>
          <div className={progress.length ? 'hidden' : null}>
            <p className="italic">No deployments in progress</p>
          </div>
          <Link to="/deployments" className="float-right">All deployments</Link>
        </div>
      </div>
    );
  }
});

Progress.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Progress;