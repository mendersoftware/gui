import React from 'react';
import { fullyDecodeURI } from '../../helpers';
var createReactClass = require('create-react-class');
var pluralize = require('pluralize');
import validator from 'validator';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

var GroupSelector = createReactClass({
  getInitialState: function() {
    return {
      showInput: false,
      invalid: true
    };
  },

  componentDidMount: function() {
    this.changeTimer;
  },

  _showButton: function() {
    this.setState({showInput: true, customName: ""});
    this.props.changeSelect("");
    this.refs.customGroup.focus();
    this.props.validateName(true, "");
  },

  _handleGroupNameSave: function(event) {
    if (!event || event['keyCode'] === 13) {
      if (!this.state.errorCode1) {
        var group = this.props.selectedGroup;
        group = this.state.groupName;
        AppActions.addToGroup(group, []);
      } else {
        this.setState({groupName: this.props.selectedGroup});
      }
    }
    if (event && event['keyCode'] === 13) {
      this.setState({
        nameEdit: false,
        errorText1:null
      });
    }
  },
  _handleGroupNameChange: function(event) {
   this.setState({groupName: event.target.value});
   this._validateName(event.target.value);
  },
  _validateName: function(name) {
    name = fullyDecodeURI(name);
    var errorText = null;
    var invalid = false;
    if  (name && !validator.isWhitelisted(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      invalid = true;
      errorText = 'Valid characters are a-z, A-Z, 0-9, _ and -';
    }
    else if (name) {
      for (var i=0;i<this.props.groups.length; i++) {
        if (fullyDecodeURI(this.props.groups[i]) === name) {
          errorText = "A group with this name already exists";
          invalid = true;
        }
      }
    } else {
      errorText = "Name cannot be left blank";
      invalid = true;
    }
    this.setState({errorText1: errorText, invalid: invalid});
    this.props.validateName(invalid, name);
  },
  _onChange: function(event) {
    this._validateName(event.target.value);
  },
  _handleTextFieldChange: function(event) {
    this.setState({customName: event.target.value});
    this._validateName(event.target.value);
  },
  _handleSelectValueChange: function(event, index, value) {
    this.setState({showInput: false, groupName:""});
    this.props.changeSelect(value);
    this.props.validateName(false);
  },

  render: function() {
    var self = this;
    var groupList = this.props.groups.map(function(group, index) {
      if (group && (group !== self.props.selectedGroup)) {
        // don't show the current selected group in the list
        return <MenuItem value={group} key={index} primaryText={decodeURIComponent(group)} />
      }
    });

    var newGroup = fullyDecodeURI(this.props.selectedField || fullyDecodeURI(this.props.tmpGroup));
    var showSelect = self.props.selectedGroup ? this.props.groups.length-1 : this.props.groups.length;

    return (
      <div style={{height: '200px'}}>
        <div className={showSelect ? "float-left" : "hidden"}>
          <div className="float-left">
            <SelectField
            ref="groupSelect"
            onChange={this._handleSelectValueChange}
            floatingLabelText="Select group"
            value={this.props.selectedField || ""}
            >
             {groupList}
            </SelectField>
          </div>
          
          <div className="float-left margin-left-small">
            <RaisedButton 
              label="Create new"
              style={{marginTop:"26px"}}
              onClick={this._showButton}/>
          </div>
        </div>

        <div className={this.state.showInput || !showSelect ? null : 'hidden'}>
          <TextField
            ref="customGroup"
            value={this.state.customName || ""}
            hintText="Name of new group"
            floatingLabelText="Name of new group"
            className="float-left clear"
            onChange={this._handleTextFieldChange}
            errorStyle={{color: "rgb(171, 16, 0)"}}
            errorText={this.state.errorText1} />
        </div>

        <div className="block float-left clear">
          <p className={newGroup ? "info" : "hidden"}>
            { this.props.selectedGroup ? 
              <span><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px"}}>error_outline</FontIcon>{this.props.devices} {pluralize("devices", this.props.devices)} will be removed from <i>{fullyDecodeURI(this.props.selectedGroup)}</i> and added to <i>{newGroup}</i>.</span>
              :
              <span><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px"}}>error_outline</FontIcon>If a device is already in another group, it will be removed from that group and moved to <i>{newGroup}</i>.</span>
            }
          </p>

          { this.props.willBeEmpty ?
            <p className="info"><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px", color:"rgb(171, 16, 0)"}}>error_outline</FontIcon>After moving the {pluralize("devices", this.props.devices)}, <i>{fullyDecodeURI(this.props.selectedGroup)}</i> will be empty and so will be removed.</p>
            : null
          }
        </div>
      </div>
    )
  }
});


module.exports = GroupSelector;