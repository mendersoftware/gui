import React from 'react';
var Schedule = require('./schedule');
var Progress = require('./progress');
var Recent = require('./recent');

// material ui
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

var Deployments = React.createClass({
  _clickHandle: function(params) {
    this.props.clickHandle(params);
  },
  render: function() {
    return (
      <div className="deployments">
        <div>
          <div className="margin-bottom">
            <Progress loading={this.props.loadingActive} clickHandle={this._clickHandle} deployments={this.props.progress} />
          </div>
          <div className="margin-bottom-large">
            <Recent loading={this.props.loadingRecent} clickHandle={this._clickHandle} deployments={this.props.recent} />
          </div>
        </div>

        <div>
          <RaisedButton onClick={this._clickHandle.bind(null, {route:"deployments",open:true})} label="Create a deployment" secondary={true} />
        </div>

      </div>
    );
  }
});

module.exports = Deployments;