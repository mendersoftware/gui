import React from 'react';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
var createReactClass = require('create-react-class');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

import { Router, Route, Link } from 'react-router';
import PropTypes from 'prop-types';
import cookie from 'react-cookie';

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

import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import { preformatWithRequestID } from '../../helpers';

import { Tabs, Tab } from 'material-ui/Tabs';

var Deployments = createReactClass({
  getInitialState: function() {
    return {
      tabIndex: this._updateActive(),
      past: AppStore.getPastDeployments(),
      pending: AppStore.getPendingDeployments(),
      progress: AppStore.getDeploymentsInProgress() || [],
      events: AppStore.getEventLog(),
      collatedArtifacts: AppStore.getCollatedArtifacts(),
      groups: AppStore.getGroups(),
      invalid: true,
      refreshDeploymentsLength: 30000,
      hasDeployments: AppStore.getHasDeployments(),
      showHelptips: AppStore.showHelptips(),
      hasPending: AppStore.getTotalPendingDevices(),
      hasDevices: AppStore.getTotalAcceptedDevices(),
      user: AppStore.getCurrentUser(),
      pageLength: AppStore.getTotalDevices(),
      isHosted: (window.location.hostname === "hosted.mender.io"),
      per_page: 20,
    }
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    var self = this;

    this.setState({docsVersion: this.props.docsVersion  ? this.props.docsVersion + "/" : "development/"});

    var artifact = AppStore.getDeploymentArtifact();
    this.setState({artifact: artifact});

    clearAllRetryTimers();    
    this.timer = setInterval(this._refreshDeployments, this.state.refreshDeploymentsLength);
    // set default date range before refreshing
    var startDate = new Date();
    startDate.setDate(startDate.getDate());
    startDate.setHours(0, 0, 0, 0); // set to start of day
    var endDate = new Date();
    endDate.setHours(23,59,59,999);
    self.setState({startDate: startDate, endDate: endDate}, function() {
      self._refreshDeployments();
    });

    var artifactsCallback = {
      success: function (artifacts) {
        var collated = AppStore.getCollatedArtifacts();
        this.setState({collatedArtifacts:collated});
      }.bind(this)
    };
    AppActions.getArtifacts(artifactsCallback);



    var countCallback = {
      success: function( count ) {
        self._getDevices(count);
      },
      error: function( err ) {
        console.log(err);
      }
    };
    AppActions.getDeviceCount(countCallback);

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
      this.setState({reportType:"active"});
    }
  },

  _getDevices: function(count) {
    var self = this;
    var pages = Math.ceil(count/500);
    var allDevices = [];

    function getDevices(pageNo) {
      AppActions.getDevices({
        success: function(devices) {
          allDevices = allDevices.concat(devices);
          self.setState({allDevices: allDevices});
          if (pageNo < pages) {
            getDevices(pageNo+1);
          }
        },
        error: function(err) {
          console.log("Error: " +err);
        }
      }, pageNo, 500);
    }
    getDevices(1);
  },

  _refreshDeployments: function() {
    if (this._getCurrentLabel() === "Finished") {
      this._refreshPast(null, null, null, null, this.state.groupFilter);
    } else {
      this._refreshInProgress();
      this._refreshPending();
    }

    if (this.state.showHelptips && !cookie.load(this.state.user.id+'-onboarded') && cookie.load(this.state.user.id+'-deploymentID')) {
      this._isOnBoardFinished(cookie.load(this.state.user.id+'-deploymentID'));
    }
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

  _changePastPage: function(page, startDate, endDate, per_page, group) {
    var self = this;
    self.setState({doneLoading: false}, function() {
      clearInterval(self.timer);
      self._refreshPast(page, startDate, endDate, per_page, group);
      self.timer = setInterval(self._refreshDeployments, self.state.refreshDeploymentsLength);
    });
  },
  _refreshPast: function(page, startDate, endDate, per_page, group) {
    /*
    / refresh only finished deployments
    /
    */
    var self = this;

    var oldCount = self.state.pastCount;
    var newCount;
    var oldPage = self.state.past_page;


    var callback = {
      success: function(deployments, links) {
        self.setState({doneLoading:true});
        self._dismissSnackBar();
      },
      error: function (err) {
        console.log(err);
        self.setState({doneLoading:true});
        var errormsg = err.error || "Please check your connection";
        setRetryTimer(err, "deployments", "Couldn't load deployments. " + errormsg, self.state.refreshDeploymentsLength);
      }
    };

    startDate = startDate || self.state.startDate;
    endDate = endDate || self.state.endDate;
    per_page = per_page || self.state.per_page;
 
    self.setState({startDate: startDate, endDate: endDate, groupFilter: group});

    startDate = Math.round(Date.parse(startDate)/1000);
    endDate = Math.round(Date.parse(endDate)/1000);

    // get total count of past deployments first
    AppActions.getDeploymentCount("finished", function(count) {
      self.setState({pastCount: count});
      newCount = count;

      page = page || self.state.past_page || 1;
      self.setState({past_page: page});
     
      // only refresh deployments if page, count or date range has changed
      if ( oldPage!==page || oldCount!==count || !self.state.doneLoading ) {
        AppActions.getPastDeployments(callback, page, per_page, startDate, endDate, group);
      }
    }, startDate, endDate, group);
  },

  _dismissSnackBar: function() {
    setTimeout(function() {
     AppActions.setSnackbar("");
    }, 1500);
  },
  _getGroupDevices: function(group) {
    // get list of devices for each group and save them to state
    var self = this;
    AppActions.getAllDevicesInGroup(group).then(devices => {
      let state = {};
      state[group] = devices;
      self.setState(state);
    });
      },
  componentWillUnmount: function() {
    clearInterval(this.timer);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },

  dialogDismiss: function(ref) {
    this.setState({
      dialog: false,
      artifact: null,
      group: null,
    });
  },
  dialogOpen: function(dialog) {
    this.setState({filteredDevices: [], deploymentDevices:[]});
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

  _retryDeployment: function(deployment, devices) {
    var self = this;
    var artifact = {name: deployment.artifact_name};
    this.setState({artifact: artifact, group: deployment.name, filteredDevices: devices}, function() {
      self._onScheduleSubmit();
    });
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
        clearInterval(self.timer);

        // onboarding
        if (self.state.showHelptips && !cookie.load(self.state.user.id+'-onboarded') && !cookie.load(self.state.user.id+'-deploymentID')) {
          cookie.save(self.state.user.id+'-deploymentID', id);
        }

        AppActions.getSingleDeployment(id, function(data) {
          if (data) {
            // successfully retrieved new deployment
            if (self.state.currentTab !== "Active") {
              self.context.router.push("/deployments/active");
              self._changeTab("/deployments/active");
              
            } else {
              self.timer = setInterval(self._refreshDeployments, self.state.refreshDeploymentsLength);
              self._refreshDeployments();
            }
            AppActions.setSnackbar("Deployment created successfully", 8000);
          } else {
            AppActions.setSnackbar("Error while creating deployment");
            self.setState({doneLoading:true});
          }
        });
      },
      error: function(err) {
        var errMsg = err.res.body.error || "";
        AppActions.setSnackbar(preformatWithRequestID(err.res, "Error creating deployment. " + errMsg), null, "Copy to clipboard");
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
  _showReport: function (deployment, type) {
    var title = type==="active" ? "Deployment progress" : "Results of deployment";
    var reportType = type;
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
    this._showReport(deployment, "active");
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

  _finishOnboard: function() {
    this.setState({onboardDialog: false});
    this.context.router.push("/deployments/finished");
    this._changeTab("/deployments/finished");
  },
  _isOnBoardFinished: function(id) {
    var self = this;
    AppActions.getSingleDeployment(id, function(data) {
      if (data.status === "finished") {
        self.setState({onboardDialog: true});
        cookie.save(self.state.user.id+'-onboarded', true);
        cookie.remove(self.state.user.id+'-deploymentID');
      }
    });
  },

  // nested tabs
  componentWillReceiveProps: function(nextProps) {
    this.setState({tabIndex: this._updateActive(), currentTab: this._getCurrentLabel()});
  },

  _updateActive: function() {
    var self = this;
    return this.context.router.isActive({ pathname: '/deployments' }, true) ? '/deployments/active' :
      this.context.router.isActive('/deployments/finished') ? '/deployments/finished' : '/deployments/active';
  },

  _getCurrentLabel: function() {
    var self = this;
    return this.context.router.isActive({ pathname: '/deployments' }, true) ? 'Active' :
      this.context.router.isActive('/deployments/active') ? 'Active' :
      this.context.router.isActive('/deployments/finished') ? 'Finished' : 'Active';
  },

  _handleTabActive: function(tab) {
    AppActions.setSnackbar("");
    this.setState({currentTab: tab.props.label});
    this.context.router.push(tab.props.value);
  },

  _changeTab: function(value) {
    var self = this;
    clearInterval(self.timer);
    self.timer = setInterval(self._refreshDeployments, self.state.refreshDeploymentsLength);
    self.setState({tabIndex: value, currentTab: self._getCurrentLabel(), pend_page:1, past_page:1, prog_page:1}, function() {
      self._refreshDeployments();
    });
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
    var onboardActions = [
      <RaisedButton
          label="Finish"
          primary={true}
          onClick={this._finishOnboard} />
    ];
    var dialogContent = '';

    if (this.state.scheduleForm) {
      dialogContent = (
        <ScheduleForm 
          hasDeployments={this.state.hasDeployments} 
          showHelptips={this.state.showHelptips} 
          deploymentDevices={this.state.deploymentDevices} 
          filteredDevices={this.state.filteredDevices} 
          hasPending={this.state.hasPending} 
          hasDevices={this.state.hasDevices} 
          deploymentSettings={this._deploymentParams} 
          id={this.state.id} 
          artifacts={this.state.collatedArtifacts} 
          artifact={this.state.artifact} 
          groups={this.state.groups} 
          group={this.state.group} />
      )
    } else if (this.state.reportType === "active") {
      dialogContent = (
        <Report globalSettings={this.props.globalSettings} abort={this._abortDeployment} updated={this.updated} deployment={this.state.selectedDeployment} />
      )
    } else {
      dialogContent = (
        <Report retry={this._retryDeployment} globalSettings={this.props.globalSettings} updated={this.updated} past={true} deployment={this.state.selectedDeployment} />
      )
    }

    var physicalLink = this.state.isHosted ?
      <p>Visit the <Link to={`/help`}>help pages</Link> for guides on provisioning Raspberry Pi 3 and BeagleBone Black devices.</p>
      :
      <p><a href={"https://docs.mender.io/"+this.state.docsVersion+"getting-started/deploy-to-physical-devices"} target="_blank">Follow the tutorial</a> in our documentation to provision Raspberry Pi 3 or BeagleBone Black devices.</p>
    ;

    // tabs
    var tabHandler = this._handleTabActive;
    var styles = {
      tabStyle : {
        display:"block",
        width:"100%",
        color: "#949495",
        textTransform: "none"
      },
      activeTabStyle : {
        display:"block",
        width:"100%",
        color: "#404041",
        textTransform: "none"
      },
      listStyle: {
        fontSize: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        whiteSpace: "normal",
      },
      listButtonStyle: {
        fontSize: "12px",
        marginTop: "-10px",
        paddingRight: "12px",
        marginLeft: "0px",
      },
    };

    return (

      <div style={{marginTop:"-15px"}}>
        <div className="top-right-button">
          <ScheduleButton secondary={true} openDialog={this.dialogOpen} />
        </div>

        <Tabs
          value={this.state.tabIndex}
          onChange={this._changeTab}
          tabItemContainerStyle={{background: "none", width:"280px"}}
          inkBarStyle={{backgroundColor: "#347a87"}}>
        
          <Tab
            label="Active"
            value="/deployments/active"
            onActive={tabHandler}
            style={this.state.tabIndex === "/deployments/active" ? styles.activeTabStyle : styles.tabStyle}>
            
            <div className="margin-top">
              <Pending page={this.state.pend_page} count={this.state.pendingCount || this.state.pending.length}  refreshPending={this._refreshPending}  pending={this.state.pending} abort={this._abortDeployment} />

              <Progress page={this.state.prog_page} isActiveTab={this.state.currentTab==="Active"} showHelptips={this.state.showHelptips && !cookie.load(this.state.user.id+'-onboarded')} hasDeployments={this.state.hasDeployments} devices={this.state.allDevices || []} hasArtifacts={this.state.collatedArtifacts.length} count={this.state.progressCount || this.state.progress.length} pendingCount={this.state.pendingCount || this.state.pending.length}  refreshProgress={this._refreshInProgress} abort={this._abortDeployment} loading={!this.state.doneLoading} openReport={this._showProgress} progress={this.state.progress} createClick={this.dialogOpen.bind(null, "schedule")}/>
            </div>
          </Tab>


          <Tab
            label="Finished"
            onActive={tabHandler}
            value="/deployments/finished"
            style={this.state.tabIndex === "/deployments/finished" ? styles.activeTabStyle : styles.tabStyle}>
            
            <div className="margin-top">
              <Past groups={this.state.groups} deviceGroup={this.state.groupFilter} createClick={this.dialogOpen.bind(null, "schedule")} pageSize={this.state.per_page} startDate={this.state.startDate} endDate={this.state.endDate} page={this.state.past_page} isActiveTab={this.state.currentTab==="Finished"} showHelptips={this.state.showHelptips} count={this.state.pastCount} loading={!this.state.doneLoading} past={this.state.past} refreshPast={this._changePastPage} showReport={this._showReport} />
            </div>
          </Tab>

        </Tabs>

       

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

          <Dialog
            ref="onboard-complete"
            actions={onboardActions}
            title="Congratulations!"
            autoDetectWindowHeight={true}
            autoScrollBodyContent={true}
            open={(this.state.onboardDialog && this.state.showHelptips) || false}
            contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
            >
            <h3>You've completed your first deployment - so what's next?</h3>

            <List>
              <ListItem
                key="physical"
                primaryText={<p>Try updating a physical device</p>}
                secondaryText={physicalLink}
                secondaryTextLines={2}
                disabled={true}
                />

                <Divider />

              <ListItem
                key="yocto"
                primaryText={<p>Try building your own Yocto Project images for use with Mender</p>}
                secondaryText={<p>See our <a href={"https://docs.mender.io/"+this.state.docsVersion+"artifacts/building-mender-yocto-image"} target="_blank">documentation site</a> for a step by step guide on how to build a Yocto Project image for a device.</p>}
                secondaryTextLines={2}
                disabled={true}
                />
            </List>

          </Dialog>

      </div>
    );
  }
});


Deployments.contextTypes = {
  router: PropTypes.object
};

module.exports = Deployments;
