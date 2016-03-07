import React from 'react';
var Schedule = require('./schedule');
var Progress = require('./progress');
var Recent = require('./recent');

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var FlatButton = mui.FlatButton;
var Dialog = mui.Dialog;

var Updates = React.createClass({
  _clickHandle: function(params) {
    this.props.clickHandle(params);
  },
  render: function() {
    var progress = this.props.progress.map(function(update, index) {
      return (
        <div key={index}>
          <p>{update.name}</p>
        </div>
      );
    });
    return (
      <div className="updates">
        <div className="dashboard-header">
          <h2>Updates</h2>
        </div>
        <div>
          <div className="flexbox">
            <Progress clickHandle={this._clickHandle} updates={this.props.progress} />
          </div>
          <div className="flexbox">
            <div>
              <RaisedButton onClick={this._clickHandle.bind(null, {route:"updates",open:true})} label="Deploy an update" secondary={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Updates;