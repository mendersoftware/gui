var React = require('react');
var AppStore = require('../../stores/app-store');

var Recent = require('./recentupdates.js');
var Schedule = require('./schedule.js');
var EventLog = require('./eventlog.js');

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
    updates: AppStore.getRecentUpdates(),
    schedule: AppStore.getScheduledUpdates(),
    events: AppStore.getEventLog()
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
            <Recent updates={this.state.updates} />

          </Tab>

          <Tab key={2}
          style={styles.tabs}
          label={"Schedule"}>
            <Schedule updates={this.state.schedule} />
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