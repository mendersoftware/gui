import React from 'react';

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var FlatButton = mui.FlatButton;


var ScheduleButton = React.createClass({
  _handleClick: function() {
    var image = null;
    if (this.props.image) {
      image = this.props.image
    }
    this.props.openDialog("schedule", image);
  },
  render: function() {
    var button = '';
    if (this.props.buttonType === 'flat') {
      button = (
        <FlatButton primary={this.props.primary} secondary={this.props.secondary} label={ this.props.label || "Deploy an update"} onClick={this._handleClick} />
      )
    } else {
      button = (
        <RaisedButton primary={this.props.primary} secondary={this.props.secondary} label={ this.props.label || "Deploy an update"} onClick={this._handleClick} />
      )
    }
    return (
      <div>{button}</div>
    );
  }
});

module.exports = ScheduleButton;