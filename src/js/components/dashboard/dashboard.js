var React = require('react');
var AppStore = require('../../stores/app-store');
var Health = require('./health');
var Schedule = require('./schedule');
var Progress = require('./progress');

function getState() {
  return {
    progress: AppStore.getProgressUpdates(new Date().getTime()),
    schedule: AppStore.getScheduledUpdates(new Date().getTime()),
    health: AppStore.getHealth()
  }
}

var Dashboard = React.createClass({
  getInitialState: function() {
    return getState();
  },
  render: function() {
    return (
      <div>
        <Progress progress={this.state.progress} />
        <Health health={this.state.health} />
        <Schedule schedule={this.state.schedule} />
      </div>
    );
  }
});

module.exports = Dashboard;