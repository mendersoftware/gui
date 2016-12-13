import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Progress = require('./inprogressdeployments.js');
var Past = require('./pastdeployments.js');
var ProgressReport = require('./progressreport.js');
var Schedule = require('./schedule.js');
var EventLog = require('./eventlog.js');
var ScheduleForm = require('./scheduleform.js');
var Report = require('./report.js');
var ScheduleButton = require('./schedulebutton.js');

import { Tabs, Tab }  from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import Snackbar from 'material-ui/Snackbar';

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
    progress: AppStore.getDeploymentsInProgress() || [],
    events: AppStore.getEventLog(),
    artifacts: AppStore.getArtifactsRepo(),
    groups: AppStore.getGroups(),
    allDevices: AppStore.getAllDevices(),
    invalid: true,
    snackbar: AppStore.getSnackbar(),
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
    var artifact = AppStore.getDeploymentArtifact();
    this.setState({artifact: artifact});
    this.timer = setInterval(this._refreshDeployments, 10000);
    this._refreshDeployments();

    var artifactsCallback = {
      success: function (artifacts) {
        this.setState({artifacts:artifacts});
      }.bind(this)
    };
    AppActions.getArtifacts(artifactsCallback);

    AppActions.getDevices({
      success: function(devices) {
        if (!devices.length) {
          AppActions.getNumberOfDevicesForAdmission(function(count) {
            if (count) {
              this.setState({hasPending:true});
            }
          }.bind(this));
        } else {
          var allDevices = [];
          for (var i=0; i<devices.length;i++) {
            allDevices.push(devices[i]);
          }
          this.setState({hasDevices:true, allDevices: allDevices});
        }
      }.bind(this),
      error: function(err) {
        console.log("Error: " +err);
      }
    }, 1, 100, null, null, true );

    var groupCallback = {
      success: function(groups) {
        this.setState({groups: groups});
        for (var x=0;x<groups.length;x++) {
          this._getGroupDevices(groups[x]);
        }
      }.bind(this),
      error: function(error) {
        console.log("Error: " + error);
      }
    };
    AppActions.getGroups(groupCallback);
  
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
    AppActions.getArtifacts();
  },
  _refreshDeployments: function() {
    this._refreshInProgress();
    this._refreshPast();
  },
  _refreshInProgress: function() {
    AppActions.getDeploymentsInProgress(function() {
      setTimeout(function() {
        this.setState({doneLoading:true});
        this._dismissSnackBar();
      }.bind(this), 300)
    }.bind(this));
  },
  _refreshPast: function() {
    AppActions.getPastDeployments(function() {
      setTimeout(function() {
        this.setState({doneLoading:true});
        this._dismissSnackBar();
      }.bind(this), 300)
    }.bind(this));
  },
  _dismissSnackBar: function() {
    setTimeout(function() {
     AppActions.setSnackbar("");
    }, 1500);
  },
  _getGroupDevices: function(group) {
    // get list of devices for each group and save them to state 
    var i
    var self = this;
    var tmp = {};
    var devs = [];
    var callback = {
      success: function(devices) {
        for (var x=0;x<devices.length;x++) {
          // get full details, not just id
          getDevicesWithDetails(devices[x], x, devices.length);
        }
      },
      error: function(err) {
        console.log(err);
      }
    };

    function getDevicesWithDetails(id, idx, max) {
      AppActions.getDeviceById(id, {
        success: function(device) {
          devs.push(device);
          if (idx === max-1) {
            tmp[group] = devs;
            self.setState(tmp);
          }
        }, 
        error: function(err) {
          console.log(err);
        }
      })
    }
    AppActions.getDevices(callback, 1, 100, group, null, true);
  },
  componentWillUnmount: function () {
    clearInterval(this.timer);
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
      artifact: null,
      group: null
    });
  },
  dialogOpen: function(dialog) {
    if (dialog === 'schedule') {
      this.setState({
        dialogTitle: "Create a deployment",
        scheduleForm: true,
        contentClass: "dialog"
      });
    }
    var title = this.state.tabIndex === "progress" ? "Deployment progress" : "Results of deployment";
    if (dialog === 'report') {
      this.setState({
        scheduleForm: false,
        dialogTitle: title,
        contentClass: "largeDialog"
      })
    }
    this.setState({dialog: true});
  },
  _changeTab: function(value) {
    this.setState({tabIndex: value});
    this._refreshDeployments();
  },
  _onScheduleSubmit: function() {
    var ids = [];
    var self = this;
    for (var i=0; i<this.state.filteredDevices.length; i++) {
      ids.push(this.state.filteredDevices[i].id);
    }
    var newDeployment = {
      name: decodeURIComponent(this.state.group) || "All devices",
      artifact_name: this.state.artifact.name,
      devices: ids
    }

    var callback = {
      success: function(data) {
        var lastslashindex = data.lastIndexOf('/');
        var id = data.substring(lastslashindex  + 1);
        AppActions.getSingleDeployment(id, function(data) {
          if (data) {
            // successfully retrieved new deployment
            AppActions.setSnackbar("Deployment created successfully");
            self._refreshDeployments();
          } else {
            AppActions.setSnackbar("Error while creating deployment");
            self.setState({doneLoading:true});
          }
        });
      },
      error: function(err) {
        AppActions.setSnackbar("Error creating deployment. "+err);
      }
    };
    AppActions.createDeployment(newDeployment, callback);
    self.setState({doneLoading:false});
    this.dialogDismiss('dialog');
  },
  _deploymentParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
    var group = (attr==="group") ? val : this.state.group;
    var artifact = (attr==="artifact") ? val : this.state.artifact;
    this._getDeploymentDevices(group, artifact);
  },
  _getDeploymentDevices: function(group, artifact) {
    var devices = [];
    var filteredDevices = [];
    // set the selected groups devices to state, to be sent down to the child schedule form
    if (artifact && group) {
      devices = (group!=="All devices") ? this.state[group] : this.state.allDevices;
      filteredDevices = AppStore.filterDevicesByType(devices, artifact.device_types_compatible);
    }
    console.log("setting state", filteredDevices);
    this.setState({deploymentDevices: devices, filteredDevices: filteredDevices});
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
 
    var artifact = '';
    var group = '';
    var start_time = null;
    var end_time = null;
    var id = null;
    if (deployment) {
      if (deployment.id) {
        id = deployment.id;
      }
      if (deployment.artifact_name) {
        artifact = AppStore.getSoftwareArtifact('name', deployment.artifact_name);
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
    this.setState({scheduleForm:true, artifactVal:artifact, id:id, start_time:start_time, end_time:end_time, artifact:artifact, group:group, groupVal:group});
    this.dialogOpen("schedule");
  },
  _scheduleRemove: function(id) {
    AppActions.removeDeployment(id);
  },
  _handleRequestClose: function() {
    this._dismissSnackBar();
  },
  _showProgress: function(rowNumber) {
    var deployment = this.state.progress[rowNumber];
    this._showReport(deployment);
  },
  render: function() {
    var disabled = (typeof this.state.filteredDevices !== 'undefined' && this.state.filteredDevices.length > 0) ? false : true;
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
        ref="save"
        disabled={disabled} />
    ];
    var reportActions = [
      <FlatButton
          label="Close"
          onClick={this.dialogDismiss.bind(null, 'dialog')} />
    ];
    var dialogContent = '';

    if (this.state.scheduleForm) {
      dialogContent = (    
        <ScheduleForm deploymentDevices={this.state.deploymentDevices} filteredDevices={this.state.filteredDevices} hasPending={this.state.hasPending} hasDevices={this.state.hasDevices} deploymentSettings={this._deploymentParams} id={this.state.id} artifacts={this.state.artifacts} artifact={this.state.artifact} groups={this.state.groups} group={this.state.group} />
      )
    } else if (this.state.tabIndex === "progress") {
      dialogContent = (
        <ProgressReport deployment={this.state.selectedDeployment} />
      )
    } else {
      dialogContent = (
        <Report deployment={this.state.selectedDeployment} retryDeployment={this._scheduleDeployment} />
      )
    }
    return (
      <div className="contentContainer allow-overflow">

      <Tabs
        tabItemContainerStyle={{width: "33%", backgroundColor: "inherit"}}
        inkBarStyle={styles.inkbar}
        value={this.state.tabIndex}
        onChange={this._changeTab}>
          <Tab key={0}
          style={styles.tabs}
          label={"In progress"}
          value="progress"> 
            <Progress openReport={this._showProgress} loading={!this.state.doneLoading} progress={this.state.progress} createClick={this.dialogOpen.bind(null, "schedule")}/>
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
          autoScrollBodyContent={true}
          contentClassName={this.state.contentClass}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          open={this.state.dialog || false}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          {dialogContent}
        </Dialog>

         <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

module.exports = Deployments;