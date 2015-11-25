var React = require('react');
var AppStore = require('../../stores/app-store');
var Health = require('./health');
var Activity = require('./activity');
var Updates = require('./updates');
var Router = require('react-router');

function getState() {
  return {
    progress: AppStore.getProgressUpdates(new Date().getTime()),
    schedule: AppStore.getScheduledUpdates(new Date().getTime()),
    health: AppStore.getHealth(),
    recent: AppStore.getRecentUpdates(new Date().getTime())
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
      <div className="contentContainer">
        <div>
          <div className="leftDashboard">
            <Health health={this.state.health} />
            <Updates progress={this.state.progress} schedule={this.state.schedule} recent={this.state.recent} />
          </div>
          <Activity />
        </div>
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Dashboard;