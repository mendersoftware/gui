import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Progress = require('./inprogressdeployments.js');
var Past = require('./pastdeployments.js');
var Schedule = require('./schedule.js');
var EventLog = require('./eventlog.js');
var ScheduleForm = require('./scheduleform.js');
var Report = require('./report.js');
var ScheduleButton = require('./schedulebutton.js');

import { Tabs, Tab }  from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var styles = {
  tabs: {
    backgroundColor: "#fff",
    color: "#414141",
    borderBottom: "1px solid #e0e0e0",
  },
  inkbar: {
    backgroundColor: "#679BA5",
  }
};

var tabs = {
  progress: '0',
  past: '1',
}

function getState() {
  return {
    past: AppStore.getPastDeployments(),
    progress: AppStore.getDeploymentsInProgress(),
    events: AppStore.getEventLog(),
    images: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups(),
    dialogTitle: "Create a deployment",
    scheduleForm: true,
    contentClass: "largeDialog", 
    invalid: true,
    dialog: false,
  }
}

var Deployments = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    AppActions.getDeploymentsInProgress(function() {
      setTimeout(function() {
        this.setState({doneLoading:true});
      }.bind(this), 300)
    }.bind(this));

    AppActions.getPastDeployments(function() {
      setTimeout(function() {
        this.setState({doneLoading:true});
      }.bind(this), 300)
    }.bind(this));

    var imagesCallback = {
      success: function (images) {
        this.setState({images:images});
      }.bind(this)
    };
    AppActions.getImages(imagesCallback);

    AppActions.getAllDevices(function(devices) {
      var pending = AppStore.getPendingDevices();
      // temporary way to find if accepted devices exist for form dropdown
      if ((devices.length-pending.length) > 0) {
        this.setState({hasDevices:true});
      }
      if (pending.length) {this.setState({hasPending: true})}
    }.bind(this));
  
    if (this.props.params) {
      this.setState({tabIndex: this._checkTabValue(this.props.params.tab)});

      if (this.props.params.params) {
        var str = decodeURIComponent(this.props.params.params);
        var obj = str.split("&");
      
        var params = [];
        for (var i=0;i<obj.length;i++) {
          var f = obj[i].split("=");
          params[f[0]] = f[1];
        }
        if (params.open) {
          var that = this;
          if (params.id) {
            that._getReportById(params.id);
          } else {
            setTimeout(function() {
              that.dialogOpen("schedule");
            }, 400);
          }
        }
      }
    } else {
      this.setState({tabIndex:"progress"});
    }
    AppActions.getImages();
  },
  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  _checkTabValue: function(value) {
    switch (value) {
      case "past":
        return "past";
        break;
      default:
        return "progress";
        break;
    }
  },
  dialogDismiss: function(ref) {
    this.setState({
      dialog: false,
      image: null,
      group: null
    });
  },
  dialogOpen: function(dialog) {
    this.setState({dialog: true});
    if (dialog === 'schedule') {
      this.setState({
        dialogTitle: "Create a deployment",
        scheduleForm: true,
        contentClass: "dialog"
      });
    }
    if (dialog === 'report') {
      this.setState({
        scheduleForm: false,
        dialogTitle: "Results of deployment",
        contentClass: "largeDialog"
      })
    }
  },
  _changeTab: function(value) {
    this.setState({tabIndex: value});
  },
  _onScheduleSubmit: function() {
    var devices = AppStore.getDevicesFromParams(this.state.group.name, this.state.image.device_type);
    var ids = [];
    for (var i=0; i<devices.length; i++) {
      ids.push(devices[i].id);
    }
    var newDeployment = {
      //id: this.state.id,
      name: this.state.group.name,
      //start_time: this.state.start_time,
      //end_time: this.state.end_time,
      artifact_name: this.state.image.name,
      devices: ids
    }
    AppActions.createDeployment(newDeployment, function(data) {
      AppActions.getDeploymentsInProgress(function() {
        this.setState(this.getInitialState());
      }.bind(this));
    }.bind(this));

    this.dialogDismiss('dialog');
  },
  _deploymentParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },
  _getReportById: function (id) {
     AppActions.getSingleDeployment(id, function(data) {
        var that = this;
        setTimeout(function() {
          that._showReport(data);
        }, 400);
    }.bind(this));
  },
  _showReport: function (deployment) {
    this.setState({scheduleForm: false, selectedDeployment: deployment});
    this.dialogOpen("report");
  },
  _scheduleDeployment: function (deployment) {
    this.setState({dialog:false});
 
    var image = '';
    var group = '';
    var start_time = null;
    var end_time = null;
    var id = null;
    if (deployment) {
      if (deployment.id) {
        id = deployment.id;
      }
      if (deployment.artifact_name) {
        image = AppStore.getSoftwareImage('name', deployment.artifact_name);
      }
      if (deployment.group) {
        group = AppStore.getSingleGroup('name', deployment.group);
      }
      if (deployment.start_time) {
        start_time = deployment.start_time;
      }
      if (deployment.end_time) {
        end_time = deployment.end_time;
      }
    }
    this.setState({scheduleForm:true, imageVal:image, id:id, start_time:start_time, end_time:end_time, image:image, group:group, groupVal:group});
    this.dialogOpen("schedule");
  },
  _scheduleRemove: function(id) {
    AppActions.removeDeployment(id);
  },
  render: function() {
    var scheduleActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'dialog')} />
      </div>,
      <RaisedButton
        label="Create deployment"
        primary={true}
        onClick={this._onScheduleSubmit}
        ref="save" />
    ];
    var reportActions = [
      <FlatButton
          label="Close"
          onClick={this.dialogDismiss.bind(null, 'dialog')} />
    ];
    var dialogContent = '';

    if (this.state.scheduleForm) {
      dialogContent = (    
        <ScheduleForm hasPending={this.state.hasPending} hasDevices={this.state.hasDevices} deploymentSchedule={this._deploymentParams} id={this.state.id} images={this.state.images} image={this.state.image} imageVal={this.state.image} groups={this.state.groups} groupVal={this.state.group} start={this.state.start_time} end={this.state.end_time} />
      )
    } else {
      dialogContent = (
        <Report deployment={this.state.selectedDeployment} retryDeployment={this._scheduleDeployment} />
      )
    }
    return (
      <div className="contentContainer allow-overflow">

      <Tabs
        tabItemContainerStyle={{width: "33%"}}
        inkBarStyle={styles.inkbar}
        value={this.state.tabIndex}
        onChange={this._changeTab}>
          <Tab key={0}
          style={styles.tabs}
          label={"In progress"}
          value="progress"> 
            <Progress loading={!this.state.doneLoading} progress={this.state.progress} showReport={this._showReport} createClick={this.dialogOpen.bind(null, "schedule")}/>
          </Tab>

          <Tab key={1}
          style={styles.tabs}
          label={"Past deployments"}
          value="past">
            <Past loading={!this.state.doneLoading} past={this.state.past} showReport={this._showReport} />
          </Tab>
        </Tabs>

        <div className="top-right-button">
          <ScheduleButton secondary={true} openDialog={this.dialogOpen} />
        </div>

        {this.state.hasDevices}

        <Dialog
          ref="dialog"
          title={this.state.dialogTitle}
          actions={this.state.scheduleForm ? scheduleActions : reportActions}
          autoDetectWindowHeight={true}
          contentClassName={this.state.contentClass}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          open={this.state.dialog}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          {dialogContent}
        </Dialog>
      </div>
    );
  }
});

module.exports = Deployments;