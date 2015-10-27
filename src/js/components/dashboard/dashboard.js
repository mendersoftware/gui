var React = require('react');
var AppStore = require('../../stores/app-store');
var Health = require('./health');
var Schedule = require('./schedule');
var Progress = require('./progress');
var Router = require('react-router');

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
  _handleWidgetClick: function(route) {
    this.context.router.transitionTo(route);
  },
  render: function() {
    return (
      <div>
        <Progress progress={this.state.progress} />
        <Health clickHandle={this._handleWidgetClick} health={this.state.health} route="/devices/1/status%3DDown" />
        <Schedule schedule={this.state.schedule} />
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Dashboard;