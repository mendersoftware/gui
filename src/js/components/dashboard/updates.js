var React = require('react');
var Schedule = require('./schedule');
var Progress = require('./progress');
var Recent = require('./recent');

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;

var Updates = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle();
  },
  render: function() {
    return (
      <div className="updates">
        <div className="dashboard-header">
          <h2>Updates</h2>
        </div>
        <div>
          <div>
            <Progress updates={this.props.progress} />
            <Schedule updates={this.props.schedule} />
          </div>
          <div className="clear">
            <Recent updates={this.props.recent} />
            <div style={{position:"absolute", bottom:"30", right:"0"}}>
              <RaisedButton label="Schedule update" secondary={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Updates;