import React from 'react';
var createReactClass = require('create-react-class');

var AppActions = require('../../actions/app-actions');
var Authsetlist = require('./authsetlist');
var ConfirmDecommission = require('./confirmdecommission');
import { preformatWithRequestID } from '../../helpers.js';

// material ui
var mui = require('material-ui');
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/RaisedButton';
import InfoIcon from 'react-material-icons/icons/action/info-outline';
import TrashIcon from 'react-material-icons/icons/action/delete';


var Authsets = createReactClass({
	getInitialState() {
		return {
			active: [],
			inactive: [],
			device: this.props.device,
		};
	},

	componentDidMount() {
		this._getActiveAuthsets(this.state.device.auth_sets);
	},

	_getActiveAuthsets: function(authsets) {
		// for each authset compare the device status and if it matches authset status, put it in correct listv
		var self = this;
		var active = [], inactive = [];
		for (var i=0;i<authsets.length; i++) {
			if (authsets[i].status === self.state.device.status) {
				active.push(authsets[i]);
			} else {
				inactive.push(authsets[i]);
			}
		}
		self.setState({active: active, inactive: inactive});
	},


	_updateDeviceAuthStatus: function (device_id, auth_id, status) {
    var self = this;

    self.setState({loading: auth_id});
		// on finish, change "loading" back to null
		var callback = {
      success: function(data) {

        // if only authset, close dialog and refresh!
        if (self.state.device.auth_sets.length <= 1) {
          self.props.dialogToggle("authsets");
        } else {
        	// refresh authset list
        	self._refreshAuth(device_id);
        	self.setState({loading: null});
        }
        AppActions.setSnackbar("Device auth status was updated successfully");
      },
      error: function(err) {
        var errMsg = err.res.error.message || "";
        console.log(errMsg);
        AppActions.setSnackbar(preformatWithRequestID(err.res, "There was a problem updating the device auth status: "+errMsg), null, "Copy to clipboard");
      }
    };

    status = status==="accept" ? "accepted" :
    status==="reject" ? "rejected" :
    status;

		if (status==="dismiss") {
			AppActions.deleteAuthset(device_id, auth_id, callback);
		} else {
			// call API to update authset
			AppActions.updateDeviceAuth(device_id, auth_id, status, callback);
		}
  },

	_showConfirm: function() {
		var decommission = !this.state.decommission;
		this.setState({decommission: decommission});
	},

	_decommissionHandler: function() {
		//handle decommission, close dialog when done
		this.props.decommission(this.state.device.id);
	},

	_refreshAuth: function(device_id) {
		var self = this;
		var callback = {
      success: function(device) {
        self.setState({device: device});
        self._getActiveAuthsets(device.auth_sets);
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    };
		AppActions.getDeviceAuth(callback, device_id);
	},	
	
	render: function() {
		var self = this;
		var activeList = <Authsetlist limitMaxed={this.props.limitMaxed} total={this.state.device.auth_sets.length} confirm={this._updateDeviceAuthStatus} loading={this.state.loading} device={this.state.device} active={true} authsets={this.state.active} />
		var inactiveList = <Authsetlist limitMaxed={this.props.limitMaxed} total={this.state.device.auth_sets.length} confirm={this._updateDeviceAuthStatus} loading={this.state.loading} device={this.state.device} hideHeader={this.state.active.length} authsets={this.state.inactive} />

		var decommission = (
      <div className="float-right">
        <FlatButton label="Decommission device" secondary={true} onClick={this._showConfirm} icon={<TrashIcon style={{height:"18px", width:"18px", verticalAlign:"middle"}}/>}/>
      </div>
    );
    if (this.state.decommission) {
      decommission = (
        <ConfirmDecommission cancel={this._showConfirm} decommission={this._decommissionHandler} />
      );
    }

		return (
      <div style={{minWidth:"900px"}}>
      	{(this.state.device.status === "accepted" || this.state.device.status === "rejected") ? decommission : null}

      	<div className="margin-bottom-small" style={{fontSize: "15px", padding: "14px 40px 0px 20px", border: "1px solid #f1f2f3", width: "fit-content"}}>
      		<span className="bold margin-right">{this.props.id_attribute || "Device ID"}</span><span>{this.props.id_value}</span>
      		<p><span className="bold margin-right">Device status</span><span className="capitalized inline-block">{this.state.device.status}</span></p>
      	</div>

      	<div className="clear">

		      {this.state.active.length ? activeList : null }

			    <div className="margin-top-large margin-bottom auto"></div>

			    {this.state.inactive.length ?
			    	<div>
			    		<h4 className="align-center">Inactive authentication sets</h4>
			       {inactiveList}
			      </div>
			    : null }

			    {
      	  this.props.limitMaxed ?
	        <div className="warning">
	          <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
	          You have reached your limit of authorized devices.
	          <p>Contact us by email at <a href="mailto:support@hosted.mender.io">support@hosted.mender.io</a> to request a higher limit.</p>
	        </div>
	     		: null
	   		}
		    </div>
      </div>
    )
	}
});

module.exports = Authsets;