var React = require('react');
var AppStore = require('../../stores/app-store');

var Recent = require('./recentupdates.js');
var Schedule = require('./schedule.js');
var EventLog = require('./eventlog.js');
var ScheduleForm = require('./scheduleform.js');

var mui = require('material-ui');
var Tabs = mui.Tabs;
var Tab = mui.Tab;

var styles = {
  tabs: {
    backgroundColor: "#fff",
    color: "#414141",
  },
  inkbar: {
    backgroundColor: "#5d0f43",
  }
};

function getState() {
  return {
    recent: AppStore.getRecentUpdates(new Date().getTime()),
    progress: AppStore.getProgressUpdates(new Date().getTime()),
    schedule: AppStore.getScheduledUpdates(new Date().getTime()),
    events: AppStore.getEventLog(),
    images: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups()
  }
}

var Updates = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  render: function() {
    return (
      <div>
         <Tabs
          tabItemContainerStyle={{width: "33%"}}
          inkBarStyle={styles.inkbar}>
          <Tab key={1}
          style={styles.tabs}
          label={"Updates"}>
            <Recent recent={this.state.recent} progress={this.state.progress} />
            <ScheduleForm primary={true} className="margin-top" groups={this.state.groups} images={this.state.images} />
          </Tab>

          <Tab key={2}
          style={styles.tabs}
          label={"Schedule"}>
            <Schedule schedule={this.state.schedule} />
            <ScheduleForm primary={true} className="margin-top" groups={this.state.groups} images={this.state.images} />
          </Tab>

          <Tab key={3}
          style={styles.tabs}
          label={"Event log"}>
            <EventLog events={this.state.events} />
          </Tab>
        </Tabs>
      </div>
    );
  }
});

module.exports = Updates;