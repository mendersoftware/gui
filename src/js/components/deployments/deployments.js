import React from 'react';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
var createReactClass = require('create-react-class');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Pending = require('./pendingdeployments.js');
var Progress = require('./inprogressdeployments.js');
var Past = require('./pastdeployments.js');
var Report = require('./report.js');
var Schedule = require('./schedule.js');
var ScheduleForm = require('./scheduleform.js');
var ScheduleButton = require('./schedulebutton.js');

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import Snackbar from 'material-ui/Snackbar';

import { preformatWithRequestID } from '../../helpers';

function getState() {
  return {
    past: AppStore.getPastDeployments(),
    pending: AppStore.getPendingDeployments(),
    progress: AppStore.getDeploymentsInProgress() || [],
    events: AppStore.getEventLog(),
    collatedArtifacts: AppStore.getCollatedArtifacts(),
    groups: AppStore.getGroups(),
    allDevices: AppStore.getAllDevices(),
    invalid: true,
    snackbar: AppStore.getSnackbar(),
    refreshDeploymentsLength: 10000,
    hasDeployments: AppStore.getHasDeployments(),
    showHelptips: AppStore.showHelptips()
  }
}

var Deployments = createReactClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    var self = this;
    clearAllRetryTimers();
    var artifact = AppStore.getDeploymentArtifact();
    this.setState({artifact: artifact});
    this.timer = setInterval(this._refreshDeployments, this.state.refreshDeploymentsLength);
    this._refreshDeployments();

    var artifactsCallback = {
      success: function (artifacts) {
        var collated = AppStore.getCollatedArtifacts();
        this.setState({collatedArtifacts:collated});
      }.bind(this)
    };
    AppActions.getArtifacts(artifactsCallback);

    AppActions.getDevices({
      success: function(devices) {
        if (!devices.length) {

          var callback = {
            success: function(count) {
              self.setState({hasPending:true});
            },
            error: function(err) {
              console.log(err);
            }
          };

          AppActions.getDeviceCount(callback, "pending");

        } else {
          var allDevices = [];
          for (var i=0; i<devices.length;i++) {
            allDevices.push(devices[i]);
          }
          self.setState({hasDevices:true, allDevices: allDevices});
        }
      },
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
      this.setState({reportType: this.props.params.tab});

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
      this.setState({reportType:"progress"});
    }
  },
  _refreshDeployments: function() {
    this._refreshInProgress();
    this._refreshPending();
    this._refreshPast();
  },
  _refreshInProgress: function(page, per_page) {
    /*
    / refresh only in progress deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({prog_page: page});
    } else {
      page = self.state.prog_page;
    }

    var callback = {
      success: function (deployments, links) {
        self.setState({doneLoading:true});
        clearRetryTimer("progress");

        // Get full count of deployments for pagination
        AppActions.getDeploymentCount("inprogress", function(count) {
          self.setState({progressCount: count});
          if (count && !deployments.length) {
            self._refreshInProgress(1);
          }
        });
        
      },
      error: function (err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    };

    AppActions.getDeploymentsInProgress(callback, page, per_page);
  },
  _refreshPending: function(page, per_page) {
    /*
    / refresh only pending deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({pend_page: page});
    } else {
      page = self.state.pend_page;
    }

    var callback = {
      success: function(deployments, links) {
        self._dismissSnackBar();

        // Get full count of deployments for pagination
        if (links.next || links.prev) {
          AppActions.getDeploymentCount("pending", function(count) {
            self.setState({pendingCount: count});
            if (count && !deployments.length) {
              self._refreshPending(1);
            }
          });
        } else {
          self.setState({pendingCount: deployments.length});
        }
      },
      error: function (err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    };

    AppActions.getPendingDeployments(callback, page, per_page);
  },
  _refreshPast: function(page, per_page) {
    /*
    / refresh only finished deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({past_page: page});
    } else {
      page = self.state.past_page;
    }

    var callback = {
      success: function(deployments, links) {
        self.setState({doneLoading:true});
        self._dismissSnackBar();

        // Get full count of deployments for pagination
        if (links.next || links.prev) {
          AppActions.getDeploymentCount("finished", function(count) {
            self.setState({pastCount: count});
            if (count && !deployments.length) {
              self._refreshPast(1);
            }
          });
        } else {
          self.setState({pastCount: deployments.length});
        }
      },
      error: function (err) {
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    };

    AppActions.getPastDeployments(callback, page, per_page);
  },
  _dismissSnackBar: function() {
    setTimeout(function() {
     AppActions.setSnackbar("");
    }, 1500);
  },
  _getGroupDevices: function(group) {
    // get list of devices for each group and save them to state
    var i;
    var self = this;
    var tmp = {};
    var devs = [];
    var callback = {
      success: function(devices) {
        tmp[group] = devices;
        self.setState(tmp);
      },
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.getDevices(callback, 1, 100, group, null, true);
  },
  componentWillUnmount: function () {
    clearInterval(this.timer);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
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
    if (dialog === 'report') {
      this.setState({
        scheduleForm: false,
        contentClass: "largeDialog"
      })
    }
    this.setState({dialog: true});
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
        var errMsg = err.res.body.error || ""
        AppActions.setSnackbar(preformatWithRequestID(err.res, "Error creating deployment. " + errMsg))
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
    this.setState({deploymentDevices: devices, filteredDevices: filteredDevices});
  },
  _getReportById: function (id) {
     AppActions.getSingleDeployment(id, function(data) {
        var that = this;
        setTimeout(function() {
          that._showReport(data, that.state.reportType);
        }, 400);
    }.bind(this));
  },
  _showReport: function (deployment, progress) {
    var title = progress==="progress" ? "Deployment progress" : "Results of deployment";
    var reportType = progress;
    this.setState({scheduleForm: false, selectedDeployment: deployment, dialogTitle: title, reportType: reportType});
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
  _handleRequestClose: function() {
    this._dismissSnackBar();
  },
  _showProgress: function(rowNumber) {
    var deployment = this.state.progress[rowNumber];
    this._showReport(deployment, "progress");
  },
  _abortDeployment: function(id) {
    var self = this;
    var callback = {
      success: function(data) {
        self.setState({doneLoading:false});
        clearInterval(self.timer);
        self.timer = setInterval(self._refreshDeployments, self.state.refreshDeploymentsLength);
        self._refreshDeployments();
        self.dialogDismiss('dialog');
        AppActions.setSnackbar("The deployment was successfully aborted");
      },
      error: function(err) {
        console.log(err);
        var errMsg = err.res.body.error || ""
        AppActions.setSnackbar(preformatWithRequestID(err.res, "There was wan error while aborting the deployment: " + errMsg));
      }
    };
    AppActions.abortDeployment(id, callback);
  },
  updated: function() {
    // use to make sure re-renders dialog at correct height when device list built
    this.setState({updated:true});
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
        <ScheduleForm hasDeployments={this.state.hasDeployments} showHelptips={this.state.showHelptips} deploymentDevices={this.state.deploymentDevices} filteredDevices={this.state.filteredDevices} hasPending={this.state.hasPending} hasDevices={this.state.hasDevices} deploymentSettings={this._deploymentParams} id={this.state.id} artifacts={this.state.collatedArtifacts} artifact={this.state.artifact} groups={this.state.groups} group={this.state.group} />
      )
    } else if (this.state.reportType === "progress") {
      dialogContent = (
        <Report abort={this._abortDeployment} updated={this.updated} deployment={this.state.selectedDeployment} />
      )
    } else {
      dialogContent = (
        <Report updated={this.updated} past={true} deployment={this.state.selectedDeployment} retryDeployment={this._scheduleDeployment} />
      )
    }
    return (
      <div className="contentContainer allow-overflow">
        <div className="top-right-button">
          <ScheduleButton secondary={true} openDialog={this.dialogOpen} />
        </div>

        <div style={{paddingTop:"3px"}}>
          <Pending count={this.state.pendingCount || this.state.pending.length}  refreshPending={this._refreshPending}  pending={this.state.pending} abort={this._abortDeployment} />

          <Progress showHelptips={this.state.showHelptips} hasDeployments={this.state.hasDeployments} devices={this.state.allDevices} hasArtifacts={this.state.collatedArtifacts.length} count={this.state.progressCount || this.state.progress.length} refreshProgress={this._refreshInProgress} abort={this._abortDeployment} loading={!this.state.doneLoading} openReport={this._showProgress} progress={this.state.progress} createClick={this.dialogOpen.bind(null, "schedule")}/>

          <Past showHelptips={this.state.showHelptips} count={this.state.pastCount} loading={!this.state.doneLoading} past={this.state.past} refreshPast={this._refreshPast} showReport={this._showReport} />

        </div>

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
          bodyStyle={{maxWidth: this.state.snackbar.maxWidth}}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

module.exports = Deployments;
