import React from 'react';
var createReactClass = require('create-react-class');
var Progress = require('./progress');
var Recent = require('./recent');

// material ui
import RaisedButton from 'material-ui/RaisedButton';

var Deployments = createReactClass({
  _clickHandle: function(params) {
    this.props.clickHandle(params);
  },
  render: function() {
    return (
      <div className="deployments">
        <div>
          <div className="margin-bottom">
            <Progress
              globalSettings={this.props.globalSettings}
              loading={this.props.loadingActive}
              clickHandle={this._clickHandle}
              deployments={this.props.progress}
            />
          </div>
          <div className="margin-bottom">
            <Recent loading={this.props.loadingRecent} clickHandle={this._clickHandle} deployments={this.props.recent} />
          </div>
        </div>

        <div>
          <RaisedButton onClick={this._clickHandle.bind(null, { route: 'deployments', open: true })} label="Create a deployment" secondary={true} />
        </div>
      </div>
    );
  }
});

module.exports = Deployments;
