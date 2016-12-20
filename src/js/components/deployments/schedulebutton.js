import React from 'react';

// material ui
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';


var ScheduleButton = React.createClass({
  _handleClick: function() {
    var artifact = null;
    if (this.props.artifact) {
      artifact = this.props.artifact
    }
    this.props.openDialog("schedule", artifact);
  },
  render: function() {
    var button = '';
    if (this.props.buttonType === 'flat') {
      button = (
        <FlatButton primary={this.props.primary} secondary={this.props.secondary} label={ this.props.label || "Create a deployment"} onClick={this._handleClick} />
      )
    } else {
      button = (
        <RaisedButton primary={this.props.primary} secondary={this.props.secondary} label={ this.props.label || "Create a deployment"} onClick={this._handleClick} />
      )
    }
    return (
      <div>{button}</div>
    );
  }
});

module.exports = ScheduleButton;