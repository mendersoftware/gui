var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Recent = require('./recentupdates.js');
var Schedule = require('./schedule.js');
var EventLog = require('./eventlog.js');
var ScheduleForm = require('./scheduleform.js');
var Report = require('./report.js');
var ScheduleButton = require('./schedulebutton.js');

var mui = require('material-ui');
var Tabs = mui.Tabs;
var Tab = mui.Tab;
var Dialog = mui.Dialog;

var styles = {
  tabs: {
    backgroundColor: "#fff",
    color: "#414141",
  },
  inkbar: {
    backgroundColor: "#5d0f43",
  }
};

var tabs = {
  updates: '0',
  schedule: '1',
  events: '2'
}

function getState() {
  return {
    recent: AppStore.getRecentUpdates(new Date().getTime()),
    progress: AppStore.getProgressUpdates(new Date().getTime()),
    schedule: AppStore.getScheduledUpdates(new Date().getTime()),
    events: AppStore.getEventLog(),
    images: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups(),
    dialogTitle: "Schedule an update",
    scheduleForm: true,
    contentClass: "largeDialog",
    tabIndex: "0"
  }
}

var Updates = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
      if (this.props.params) {
        this.setState({tabIndex: tabs[this.props.params.tab]});
      }
  },
  _onChange: function() {
    this.setState(getState());
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(dialog) {
    if (dialog === 'schedule') {
      this.setState({
        dialogTitle: "Schedule an update",
        scheduleForm: true,
        contentClass: null
      });
    }
    if (dialog === 'report') {
      this.setState({
        scheduleForm: false,
        dialogTitle: "Update results",
        contentClass: "largeDialog"
      })
    }
    if (!this.refs['dialog'].isOpen()) {
      this.refs['dialog'].show();
    }
  },
  _onScheduleSubmit: function() {
    var newUpdate = {
      group: this.state.group,
      model: this.state.model,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      image: this.state.image
    }
    AppActions.saveSchedule(newUpdate, this.state.disabled);
    this.dialogDismiss('dialog');
  },
  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },
  _showReport: function (report) {
     this.setState({scheduleForm: false, showReport:report});
     this.dialogOpen("report");
  },
  _scheduleUpdate: function (update) {
    var image = '';
    var group = '';
    if (update) {
      if (update.software_version) {
        image = AppStore.getSoftwareImage('name', update.software_version);
      }
      if (update.group) {
        group = AppStore.getSingleGroup('name', update.group);
      }
    }
    this.setState({scheduleForm:true, imageVal:image, image:image, group:group, groupVal:group});
    this.dialogOpen("schedule");
  },
  render: function() {
    var scheduleActions =  [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'dialog')},
      { text: 'Schedule update', onClick: this._onScheduleSubmit, ref: 'save' }
    ];
    var reportActions = [
      { text: 'Close' }
    ];
    var dialogContent = '';

    if (this.state.scheduleForm) {
      dialogContent = (    
        <ScheduleForm updateSchedule={this._updateParams} images={this.state.software} image={this.state.image} imageVal={this.state.image} groups={this.state.groups} groupVal={this.state.group} />
      )
    } else {
      dialogContent = (
        <Report retryUpdate={this._scheduleUpdate} update={this.state.showReport} />
      )
    }
    return (
      <div>
         <Tabs
          tabItemContainerStyle={{width: "33%"}}
          inkBarStyle={styles.inkbar}
          value={this.state.tabIndex}>
          <Tab key={1}
          style={styles.tabs}
          label={"Updates"}
          value="0">
            <Recent recent={this.state.recent} progress={this.state.progress} showReport={this._showReport} />
            <div style={{marginTop:"45"}}>
              <ScheduleButton primary={true} openDialog={this.dialogOpen} />
            </div>
          </Tab>

          <Tab key={2}
          style={styles.tabs}
          label={"Schedule"}
          value="1">
            <Schedule schedule={this.state.schedule} />
            <div style={{marginTop:"45"}}>
              <ScheduleButton style={{marginTop:"45"}} primary={true}  openDialog={this.dialogOpen} />
            </div>
          </Tab>

          <Tab key={3}
          style={styles.tabs}
          label={"Event log"}
          value="2">
            <EventLog events={this.state.events} />
          </Tab>
        </Tabs>
      
        <Dialog
          ref="dialog"
          title={this.state.dialogTitle}
          actions={this.state.scheduleForm ? scheduleActions : reportActions}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          contentClassName={this.state.contentClass}
          >
          {dialogContent}
        </Dialog>
      </div>
    );
  }
});

module.exports = Updates;