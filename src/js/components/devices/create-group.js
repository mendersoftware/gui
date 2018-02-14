import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import SearchInput from 'react-search-input';
import cookie from 'react-cookie';
import FontIcon from 'material-ui/FontIcon';
import Checkbox from 'material-ui/Checkbox';
import validator from 'validator';
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var Loader = require('../common/loader');

import { preformatWithRequestID } from '../../helpers';

var CreateGroup = createReactClass({

  getInitialState: function() {
    return {
      errorText:'',
      showDeviceList: false,
      newGroup: '',
      nextInvalid: true,
      createInvalid: true,
      devices: [],
      selectedRows: [],
      pageNo: 1,
      pageLength: 0,
      user: AppStore.getCurrentUser(),
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.open!==this.props.open) {
      this.setState(this.getInitialState());
    }
  },

  _getDevices: function() {
     var self = this;
       var callback =  {
        success: function(devices) {
          self.setState({devices: devices, loading: false, pageLoading: false});
        },
        error: function(error) {
          console.log(err);
          var errormsg = err.error || "Please check your connection.";
          self.setState({loading: false});
             // setRetryTimer(err, "devices", "Devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
        }
      };
      AppActions.getDevices(callback, this.state.pageNo, this.state.pageLength, this.state.selectedGroup);
  },

  _createGroupHandler: function() {
    var self = this;
    if (!this.state.user) {
      this.setState({user: AppStore.getCurrentUser()});
    }
    var seenWarning = cookie.load(this.state.user.id+'-groupHelpText');
    // if another group exists, check for warning message cookie
    if (this.props.groups.length && !seenWarning) {
        // if show warning message
        this.setState({showDeviceList: false, showWarning:true});
    } else {
      var devices = [];
      for (var i=0;i<this.state.selectedRows.length;i++) {
        var device = this.state.devices[this.state.selectedRows[i]];
        devices.push(device);
      }
       // cookie exists || if no other groups exist, continue to create group
      this.props.addListOfDevices(devices, this.state.newGroup);
    }
  },


  validateName: function(e) {
    var newName = e.target.value;
    this.setState({newGroup: newName});
    var invalid = false;
    var errorText = null;
    if (newName) {
      if (!validator.isWhitelisted(newName, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
        invalid = true;
        errorText = 'Valid characters are a-z, A-Z, 0-9, _ and -';
      } else {
        for (var i=0;i<this.props.groups.length; i++) {
          if (decodeURIComponent(this.props.groups[i]) === newName) {
            invalid = true;
            errorText = "A group with this name already exists";
          }
        }
      }
      this.setState({errorText: errorText, nextInvalid: invalid});
    } else {
      invalid = true;
      errorText = "Name cannot be left blank";
      this.setState({errorText: errorText, nextInvalid: invalid});
    }
  },

  _loadMoreDevs: function() {
    var self = this;
    var numberDevs = this.state.pageLength;
    numberDevs += 10;

    this.setState({showDeviceList: true, pageLength: numberDevs}, function() {
        self._getDevices();
    });
  },

  _onRowSelection: function(selectedRows) {
  
    var invalid = true;
    if (selectedRows === "all") {
      var rows = Array.apply(null, {length: this.state.devices.length}).map(Number.call, Number);
      invalid = false;
      this.setState({selectedRows: rows, createInvalid: invalid});
    } else if (selectedRows === "none") {
      this.setState({selectedRows: [], createInvalid: invalid});
    } else {
      invalid = false;
      this.setState({selectedRows: selectedRows, createInvalid: invalid});
    }
  },


  _handleCheckBox: function(event, isChecked) {
    var self = this;
    this.setState({isChecked: isChecked});
      if (isChecked) {
        cookie.save(self.state.user.id+'-groupHelpText', true);
      }
  },

  _isSelected: function(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  },

  _handleClose: function() {
    this.setState({newGroup:'', showDeviceList: false, createInvalid: true, nextInvalid: true, showWarning: false, selectedRows:[], pageLength:0, errorText:''});
    this.props.toggleDialog("createGroupDialog");
  },

  render: function() {

    var deviceList = this.state.devices.map(function(device, index) {
      var attrs = {
        device_type: "",
        artifact_name: ""
      };

      var attributesLength = device.attributes ? device.attributes.length : 0; 
      for (var i=0;i<attributesLength;i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }
      return (
        <TableRow selected={this._isSelected(index)} key={index}>
          <TableRowColumn>
            {device.id}
          </TableRowColumn>
          <TableRowColumn>
            {attrs.device_type}
          </TableRowColumn>
        </TableRow>
      );
    },this);



    var createActions = [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this._handleClose} />
      </div>,
      <RaisedButton
        label={this.state.showWarning ? "Confirm" : "Create group"}
        primary={true}
        onClick={this.state.showWarning ? this.props.addListOfDevices.bind(null, this.state.selectedRows, this.state.newGroup) : this._createGroupHandler}
        disabled={this.state.createInvalid} />
    ];

    return (
      <Dialog
        ref="createGroup"
        title={this.state.showWarning ? "" : "Create a new group"}
        actions={createActions}
        open={this.props.open}
        autoDetectWindowHeight={true} autoScrollBodyContent={true} modal={true}
        bodyStyle={{maxHeight:"50vh"}}
        titleStyle={{paddingBottom: "15px", marginBottom:0}}
        footerStyle={{marginTop:0}}
        >

        <div className={this.state.showDeviceList || this.state.showWarning ? "hidden" : "absoluteTextfieldButton" }>
          <TextField
            ref="customGroup"
            className="float-left"
            hintText="Name your group"
            floatingLabelText="Name your group"
            value={this.state.newGroup}
            onChange={this.validateName}
            errorStyle={{color: "rgb(171, 16, 0)"}}
            errorText={this.state.errorText} />

          <div className={this.state.showDeviceList ? "hidden" : "float-left margin-left-small"}>
            <RaisedButton disabled={this.state.nextInvalid} style={{marginTop:"26px"}} label="Next" secondary={true} onClick={this._loadMoreDevs}/>
          </div>

        </div>

        {this.state.showWarning ?
          <div className="help-message" style={{marginTop: "-30px"}}>
            <h2><FontIcon className="material-icons" style={{marginRight:"4px", top: "4px"}}>error_outline</FontIcon>You're creating a new group</h2>
            <p>
              Just a heads-up: if a device is already in another group, it will be removed from that group and moved to the new one. A device can only belong to one group at a time.
            </p>


            <Checkbox
              label="Got it! Don't show this message again"
              labelStyle={{fontSize: "13px", color: "rgba(0, 0, 0, 0.6)"}}
              onCheck={this._handleCheckBox}
            />
          </div>
          :

          <div className={this.state.showDeviceList===true ? "dialogTableContainer" : "dialogTableContainer zero"}>
            <Table
              multiSelectable={true}
              className={deviceList.length ? null : "hidden"}
              onRowSelection={this._onRowSelection}
              selectable={true}>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>ID</TableHeaderColumn>
                  <TableHeaderColumn>Device type</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickaway={false}
                showRowHover={true}>
                {deviceList}
              </TableBody>
            </Table>
            {this.state.hasNext ? <a className="small" onClick={this._loadMoreDevs}>Load more devices</a> : null }
            <Loader show={this.props.loadingDevices} />
            <p className={(deviceList.length||this.props.loadingDevices) ? "hidden" : "italic muted"}>
              No devices match the search term
            </p>
          </div>

        }
      </Dialog>
    )
  }
});

module.exports = CreateGroup;
