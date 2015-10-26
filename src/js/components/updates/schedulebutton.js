var React = require('react');

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;



var ScheduleButton = React.createClass({
  _handleClick: function() {
    var image = null;
    if (this.props.image) {
      image = this.props.image
    }
    this.props.openDialog("schedule", image);
  },
  render: function() {
    return (
      <RaisedButton primary={this.props.primary} secondary={this.props.secondary} label="Schedule an update" onClick={this._handleClick} />
    );
  }
});

module.exports = ScheduleButton;