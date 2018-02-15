import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { DevicesNav } from '../helptips/helptooltips';

var createReactClass = require('create-react-class');
var DeviceGroups = require('./device-groups');
var PendingDevices = require('./pending-devices');
var RejectedDevices = require('./rejected-devices');
var pluralize = require('pluralize');
var Loader = require('../common/loader');

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');


import { Router, Route, Link } from 'react-router';

import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';


var Devices = createReactClass({
	getInitialState() {
		return {
			tabIndex: this._updateActive(),
			acceptedCount: AppStore.getTotalAcceptedDevices(),
			rejectedCount: AppStore.getTotalRejectedDevices(),
			pendingCount: AppStore.getTotalPendingDevices(),
			snackbar: AppStore.getSnackbar(),
      refreshLength: 10000,
      showHelptips: AppStore.showHelptips(),
		};
	},

	componentWillMount: function() {
  	AppStore.changeListener(this._onChange);
	},

	_onChange: function() {
  	this.setState(this.getInitialState());
	},


	componentDidMount() {
    clearAllRetryTimers();
    this._restartInterval();
	},

	componentWillUnmount() {
    clearAllRetryTimers();
    clearInterval(this.interval);
		AppStore.removeChangeListener(this._onChange);
	},

	_refreshAll: function() {
		this._getAcceptedCount();
		this._getRejectedCount();
		this._getPendingCount();
	},

  _restartInterval: function() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(function() {
      AppActions.setSnackbar("");
      self._refreshAll()
    }, self.state.refreshLength);
    self._refreshAll();
  },

  _changeTab: function() {
    //this._restartInterval();
  },


	/*
	* Get counts of devices
	*/
	_getAcceptedCount: function() {
		var self = this;
		var callback = {
			success: function(count) {
				self.setState({acceptedCount: count});
			},
			error: function(error) {

			}
		};
		AppActions.getDeviceCount(callback, "accepted");
	},
	_getRejectedCount: function() {
		var self = this;
		var callback = {
			success: function(count) {
				self.setState({rejectedCount: count}, self._getAllCount());
			},
			error: function(error) {

			}
		};
		AppActions.getDeviceCount(callback, "rejected");
	},
	_getPendingCount: function() {
		var self = this;
		var callback = {
			success: function(count) {
				self.setState({pendingCount: count});
			},
			error: function(error) {

			}
		};
		AppActions.getDeviceCount(callback, "pending");
	},
  _getAllCount: function() {
    var self = this;
    var accepted = self.state.acceptedCount ? self.state.acceptedCount : 0;
    var rejected = self.state.rejectedCount ? self.state.rejectedCount : 0;
    self.setState({allCount: accepted + rejected});
  },



	// nested tabs
	componentWillReceiveProps: function(nextProps) {
  	this.setState({tabIndex: this._updateActive()});
	},

  _updateActive: function() {
    var self = this;
    return this.context.router.isActive({ pathname: '/devices' }, true) ? '/devices/groups' :
      this.context.router.isActive('/devices/groups') ? '/devices/groups' :
      this.context.router.isActive('/devices/pending') ? '/devices/pending' :
      this.context.router.isActive('/devices/rejected') ? '/devices/rejected' : '/devices/groups';
	},
	
	_handleTabActive: function(tab) {
		AppActions.setSnackbar("");
		this.setState({currentTab: tab.props.label});
	    this.context.router.push(tab.props.value);
	},


	// authorize devices
	_authorizeDevices: function(devices) {
	    /*
	    * function for authorizing group of devices via devadmn API
	    */
	    var self = this;
	    self.setState({pauseAdmisson: true, reject_request_pending: true});
	    clearInterval(self.interval);

	    // make into chunks of 5 devices
	    var arrays = [], size = 5;
	    var deviceList = devices.slice();
	    while (deviceList.length > 0) {
	      arrays.push(deviceList.splice(0, size));
	    }

	    var i = 0;
	    var success = 0;
	    var loopArrays = function(arr) {
	      // for each chunk, authorize one by one
	      self._authorizeBatch(arr[i], function(num) {
	        success = success+num;
	        i++;
	        if (i < arr.length) {
	          loopArrays(arr);
	        } else {
	          AppActions.setSnackbar(success + " " + pluralize("devices", success) + " " + pluralize("were", success) + " authorized");
	          // refresh counts
            self._restartInterval();
            setTimeout(function() {
              self.setState({pauseAdmisson: false, rejectDialog: false, reject_request_pending:false});
            }, 200);
            
	        }
	      });
	    }
	    loopArrays(arrays);
	  },
	  _authorizeBatch(devices, callback) {
	    // authorize the batch of devices one by one, callback when finished
	    var i = 0;
	    var fail = 0;
	    var singleCallback = {
	      success: function(data) {
	        i++;
	        if (i===devices.length) {
	          callback(i);
	        }
	      }.bind(this),
	      error: function(err) {
	        var errMsg = err.res.body.error || ""

	        fail++;
	        i++;

	        AppActions.setSnackbar(preformatWithRequestID(err.res, "There was a problem authorizing the device: "+errMsg));
	        if (i===devices.length) {
	          callback(i-fail);
	        }
	      }
	    };

	    devices.forEach( function(device, index) {
	      AppActions.acceptDevice(device.id, singleCallback);
	    });
	},

  _authorizeDevice: function() {
    // authorize single device from dialog
    this._authorizeDevices([this.state.deviceToReject]);
  },

	_handleRejectDevice: function(device) {
		var self = this;
		this.setState({deviceToReject: device}, function() {
			self._rejectDevice();
		})
	},

	_rejectDevice: function() {
	    var self = this;
	   	self.setState({pauseAdmisson: true, reject_request_pending: true});
	    clearInterval(self.interval);

	    var callback = {
	      success: function(data) {
	        AppActions.setSnackbar("Device was rejected successfully");
	        self._restartInterval();
	        self.setState({pauseAdmisson: false, rejectDialog: false, reject_request_pending: false});
	      },
	      error: function(err) {
	        var errMsg = err.res.body.error || "";
	        self.setState({pauseAdmisson: false, reject_request_pending: false});
	        AppActions.setSnackbar(preformatWithRequestID(err.res, "There was a problem rejecting the device: "+errMsg));
	      }
	    };

	    AppActions.rejectDevice((this.state.deviceToReject||{}).id, callback);
	},

	_decommissionDevice: function() {
		 var self = this;

	   	self.setState({pauseAdmisson: true, decommission_request_pending: true});
	    clearInterval(self.interval); // pause periodic calls to device apis until finished authing devices
	    var callback = {
	      success: function(data) {
	        AppActions.setSnackbar("Device was decommissioned successfully");
	        self._restartInterval();
	        self.setState({pauseAdmisson: false, decommission_request_pending: false, rejectDialog: false});
	      },
	      error: function(err) {
	        var errMsg = err.res.error.message || "";
          console.log(errMsg);
	        AppActions.setSnackbar(preformatWithRequestID(err.res, "There was a problem decommissioning the device: "+errMsg));
          self.setState({pauseAdmisson: false, decommission_request_pending: false});
	      }
	    };
	   AppActions.decommissionDevice((this.state.deviceToReject||{}).device_id, callback);
	},

	dialogToggle: function (ref) {
	    var state = {};
	    state[ref] = !this.state[ref];
	    this.setState(state);
	},

	_openRejectDialog: function(device, status) {
	    device.status = status;
	    this.setState({rejectDialog: true, deviceToReject: device});
	},


	render: function() {
		// nested tabs
	    var tabHandler = this._handleTabActive;
	    var styles = {
	      tabStyle : {
	        display:"block",
	        width:"100%",
	        color: "rgba(0, 0, 0, 0.8)",
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

        var rejectActions =  [
	      <div style={{marginRight:"10px", display:"inline-block"}}>
	        <FlatButton
	          label="Cancel"
	          onClick={this.dialogToggle.bind(null, "rejectDialog")} />
	      </div>
	    ];

	    var pendingLabel = this.state.pendingCount ? "Pending (" + this.state.pendingCount + ")" : "Pending";

		return (
			<div className="contentContainer" style={{marginTop: "10px"}}>

		    <Tabs
          value={this.state.tabIndex}
          onChange={this._changeTab}
          tabItemContainerStyle={{background: "none", width:"420px"}}>

          <Tab
            label="Device groups"
            value="/devices/groups"
            onActive={tabHandler}
            style={styles.tabStyle}>

				    <DeviceGroups 
              params={this.props.params}
              rejectOrDecomm={this._openRejectDialog}
              styles={styles} 
              paused={this.state.pauseAdmisson} 
              rejectedDevices={this.state.rejectedCount} 
              acceptedDevices={this.state.acceptedCount} 
              allCount={this.state.allCount} 
              currentTab={this.state.currentTab} 
              snackbar={this.state.snackbar} 
              rejectDevice={this._rejectDevice}
              showHelptips={this.state.showHelptips} />
		      </Tab>
			    <Tab
            label={pendingLabel}
            value="/devices/pending"
            onActive={tabHandler}
            style={styles.tabStyle}>

						<PendingDevices 
              styles={styles} 
              currentTab={this.state.currentTab}
              snackbar={this.state.snackbar} 
              disabled={this.state.pauseAdmisson} 
              authorizeDevices={this._authorizeDevices} 
              count={this.state.pendingCount} 
              rejectDevice={this._handleRejectDevice}
              showHelptips={this.state.showHelptips}
              highlightHelp={!this.state.acceptedCount} />
					</Tab>


          <Tab
            label="Rejected"
            value="/devices/rejected"
            onActive={tabHandler}
            style={styles.tabStyle}>

            <RejectedDevices rejectOrDecomm={this._openRejectDialog} styles={styles} currentTab={this.state.currentTab} snackbar={this.state.snackbar} disabled={this.state.pauseAdmisson} authorizeDevices={this._authorizeDevices} count={this.state.rejectedCount} rejectDevice={this._handleRejectDevice} />
          </Tab>
				</Tabs>

				 <Dialog
		          ref="rejectDialog"
		          open={this.state.rejectDialog || false}
		          title={(this.state.deviceToReject||{}).status!=="rejected" ? 'Reject or decommission device?' : "Authorize or decommission device?"}
		          actions={rejectActions}
		          autoDetectWindowHeight={true}
		          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
		          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
		          >
		          {this.state.deviceToReject ? <ListItem className="margin-bottom-small" style={styles.listStyle} disabled={true} primaryText="Device ID" secondaryText={this.state.deviceToReject.device_id}  />: null}
		          {(this.state.deviceToReject||{}).status==="accepted" ?
		            <div className="split-dialog">
		              <div className="align-center">
		                <div>
		                  <FontIcon className="material-icons" style={{marginTop:6, marginBottom:6, marginRight:6, verticalAlign: "middle", color:"#c7c7c7"}}>cancel</FontIcon>
		                  <h3 className="inline align-middle">Reject</h3>
		                </div>
		                <p style={{minHeight:"32px"}}>
		                  De-authorize this device and block it from making authorization requests in the future.
		                </p>
		                <RaisedButton onClick={this._rejectDevice} className="margin-top-small" secondary={true} label={"Reject device"} icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">cancel</FontIcon>} />
		                {this.state.reject_request_pending ?  <div className="dialogLoaderContainer"><Loader table={true} show={true} /></div> : null}
                  </div>
		            </div> 
		          : 
		          	<div className="split-dialog">
		              	<div className="align-center">
			                <div>
			                  <FontIcon className="material-icons" style={{marginTop:6, marginBottom:6, marginRight:6, verticalAlign: "middle", color:"#c7c7c7"}}>check_circle</FontIcon>
			                  <h3 className="inline align-middle">Authorize</h3>
			                </div>
			                <p style={{minHeight:"32px"}}>
			                 	Authorize this device and allow it to connect to the server.
			                </p>
			                <RaisedButton onClick={this._authorizeDevice} className="margin-top-small" secondary={true} label={"Authorize device"} icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">check_circle</FontIcon>} />
			               {this.state.reject_request_pending ?  <div className="dialogLoaderContainer"><Loader table={true} show={true} /></div> : null}
                    </div>
		            </div>
		          }

		          <div className="split-dialog left-border">
		            <div className="align-center">
		              <div>
		                <FontIcon className="material-icons" style={{marginTop:6, marginBottom:6, marginRight:6, verticalAlign: "middle", color:"#c7c7c7"}}>delete_forever</FontIcon>
		                <h3 className="inline align-middle">Decommission</h3>
		              </div>
		              <p style={{minHeight:"32px"}}>
		                Decommission this device and remove all device data. This action is not reversible.
		              </p>
		              
                  <RaisedButton onClick={this._decommissionDevice} className="margin-top-small" secondary={true} label={"Decommission device"} icon={<FontIcon style={{marginTop:"-4px"}} className="material-icons">delete_forever</FontIcon>} />
		              {this.state.decommission_request_pending ?  <div className="dialogLoaderContainer"><Loader table={true} show={true} /></div> : null}
                </div>
		          </div>
		        </Dialog>


            { !this.state.acceptedCount && this.state.showHelptips && this.state.tabIndex!=="/devices/pending" ?
            <div>
              <div
                id="onboard-15"
                className="tooltip help highlight"
                data-tip
                data-for='devices-nav-tip'
                data-event='click focus'
                style={{left: "14%", top:"40px"}}>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="devices-nav-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <DevicesNav devices={this.state.pendingCount} />
              </ReactTooltip>
            </div> : null }

			</div>

		);
	}

});

Devices.contextTypes = {
  router: PropTypes.object
};


module.exports = Devices;