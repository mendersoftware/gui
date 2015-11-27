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
    recent: AppStore.getRecentUpdates(new Date().getTime()),
    activity: AppStore.getActivity()
  }
}

var Dashboard = React.createClass({
  getInitialState: function() {
    return getState();
  },
  _handleClick: function(params) {
    var id = params.id ? params.id : null;

    switch(params.route){
      case "updates":
        var URIParams = "open="+params.open;
        URIParams = encodeURIComponent(URIParams);
        this.context.router.transitionTo("/updates/:tab/:params/", {tab:0, params:URIParams}, null);
        break;
    }
  },
  render: function() {
    return (
      <div className="contentContainer">
        <div>
          <div className="leftDashboard">
            <Health health={this.state.health} />
            <Updates clickHandle={this._handleClick} progress={this.state.progress} schedule={this.state.schedule} recent={this.state.recent} />
          </div>
          <Activity activity={this.state.activity} />
        </div>
      </div>
    );
  }
});

Dashboard.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Dashboard;