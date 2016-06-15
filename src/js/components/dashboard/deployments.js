import React from 'react';
var Schedule = require('./schedule');
var Progress = require('./progress');
var Recent = require('./recent');

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var FlatButton = mui.FlatButton;
var Dialog = mui.Dialog;

var Deployments = React.createClass({
  _clickHandle: function(params) {
    this.props.clickHandle(params);
  },
  render: function() {
    var progress = this.props.progress.map(function(deployment, index) {
      return (
        <div key={index}>
          <p>{deployment.name}</p>
        </div>
      );
    });
    return (
      <div className="deployments">
        <div className="dashboard-header">
          <h2>Deployments</h2>
        </div>
        
       
        <div className={this.props.progress.length || this.props.recent.length ? "hidden" : "dashboard-placeholder" }>
          <p>Monitor ongoing and recent deployments from here</p>
          <img src="assets/img/deployments.png" alt="deployments" />
        </div>

        <div className={this.props.progress.length || this.props.recent.length ? null : "hidden" }>
          <div>
            <div className="margin-bottom margin-top">
              <Progress clickHandle={this._clickHandle} deployments={this.props.progress} />
            </div>
            <div className="margin-bottom-large">
              <Recent clickHandle={this._clickHandle} deployments={this.props.recent} />
            </div>
          </div>
          <div>
            <div>
              <RaisedButton onClick={this._clickHandle.bind(null, {route:"deployments",open:true})} label="Deploy an update" secondary={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Deployments;