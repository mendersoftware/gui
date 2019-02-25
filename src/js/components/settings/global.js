import React from 'react';
import Form from '../common/forms/form';
import SelectInput from '../common/forms/selectinput';
import PasswordInput from '../common/forms/passwordinput';
import { isEmpty, preformatWithRequestID, deepCompare, intersection } from '../../helpers.js';

require('../common/prototype/Array.prototype.equals');

var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';


var Global = createReactClass({
	getInitialState() {
		return {
			disabled: true,
			settings: {
				id_attribute: "Device ID",
			},
			updatedSettings: {
				id_attribute: "Device ID",
			},
			id_attributes: [{value:"Device ID", label:"Device ID"}],
		};
	},
	componentDidMount() {
		this.getSettings();
		this.getIdentityAttributes();
	},
	getSettings: function() {
		var self = this;
		var callback = {
			success: function(settings) {
				if (!isEmpty(settings)) {
					self.setState({settings: settings, updatedSettings: settings});
				}
			},
			error: function(err) {
				console.log("error");
			}
		};
		AppActions.getGlobalSettings(callback);
	},
	getIdentityAttributes: function() {
		var self = this;
		var callback = {
			success: function(devices) {
        const availableAttributes = devices.reduce((accu, item) => {
          return Object.keys(item.identity_data).reduce((keyAccu, key) => {
            keyAccu[key] = keyAccu[key] + 1 || 1;
            return keyAccu;
          }, accu);
        }, {});
        const id_attributes = Object.entries(availableAttributes)
          // sort in reverse order, to have most common attribute at the top of the select
          .sort((a, b) => b[1] - a[1])
          // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
          .slice(0, AVAILABLE_ATTRIBUTE_LIMIT)
          .reduce(
            (accu, item) => {
              accu.push({ value: item[0], label: item[0] });
              return accu;
			},
            [{ value: 'Device ID', label: 'Device ID' }]
          );
        self.setState({ id_attributes });
      },
			error: function(err) {
        console.log('error');
			}
		};
    AppActions.getDevicesByStatus(callback, null, 1, 500);
	},

	changeIdAttribute: function (value) { 
		var self = this;
		this.setState({updatedSettings: {id_attribute: value}});
	},

	hasChanged: function () {
		// compare to see if any changes were made
		var changed = this.state.updatedSettings ? !deepCompare(this.state.settings, this.state.updatedSettings) : false;
		return changed;
	},

	undoChanges: function() {
		var self = this;
		this.setState({updatedSettings: self.state.settings});
		if (this.props.dialog) {
			this.props.closeDialog();
		}
	},

	saveSettings: function() {
		var self = this;
		var callback = {
			success: function() {
				self.setState({settings: self.state.updatedSettings});
				AppActions.setSnackbar("Settings saved successfully");
				if (self.props.dialog) {
					self.props.closeDialog();
				}
			},
			error: function(err) {
				console.log(err);
				AppActions.setSnackbar(preformatWithRequestID(err.res, "The settings couldn't be saved. " + err.res.body.error));
			}
		};
		AppActions.saveGlobalSettings(self.state.updatedSettings, callback);
	},

	render: function() {
		var changed = this.hasChanged();
		var id_hint = (
			<div>
			<p>Choose a device identity attribute to use to identify your devices throughout the UI.</p>
			<p><a href="https://docs.mender.io/client-configuration/identity" target="_blank">Learn how to add custom identity attributes</a> to your devices.</p>
			</div>
		);

		return (
			<div style={{maxWidth: "750px"}} className="margin-top-small">

		        {this.props.dialog ? null : 
		        	<div>
		        		<h2 style={{marginTop: "15px"}}>Global settings</h2>
		        		<p className="info" style={{marginBottom: "30px"}}><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px"}}>info_outline</FontIcon>These settings apply to all users, so changes made here may affect other users' experience.</p>
		        	</div>
		        }
		        
		        <Form>

		          <SelectInput
		          	hint="Device identity attribute"
		            label="Device identity attribute"
		            id="deviceid"
		            onChange={this.changeIdAttribute}
		            menuItems={this.state.id_attributes}
		            style={{width: "400px"}}
		            value={this.state.updatedSettings.id_attribute}
		            extraHint={id_hint} />
		        </Form>
		        
		        <div className="margin-top-large">
  					<div className="float-right">
			            <FlatButton disabled={!changed && !this.props.dialog} onClick={this.undoChanges} style={{marginRight:"10px"}} label="Cancel" />
			            <RaisedButton onClick={this.saveSettings} disabled={!changed} primary={true} label="Save" />
		            </div>
		        </div>

		       
	    	</div>
		)
	},

});

module.exports = Global;