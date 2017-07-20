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
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var Loader = require('../common/loader');

var DevicePicker = createReactClass({

  getInitialState: function() {
    return {
      errorText1:'',
      showDeviceList: false,
      newGroup: '',
      nextInvalid: true,
      createInvalid: true,
    };
  },

  componentDidUpdate: function(nextProps, nextState) {
    if (nextProps.open !== this.props.open) {
      this.setState({newGroup:'', numberDevs: 0})
    }
  },

  _createGroupHandler: function() {
    var seenWarning = cookie.load(this.props.user.id+'-groupHelpText');
    // if another group exists, check for warning message cookie
    if (this.props.groupList.length && !seenWarning) {
        // if show warning message
        this.setState({showDeviceList: false, showWarning:true});
    } else {
       // cookie exists || if no other groups exist, continue to create group
      this._addListOfDevices();
    }
  },

  _addListOfDevices: function() {
    for (var i=0;i<this.state.selectedDevices.length;i++) {
      var group = encodeURIComponent(this.state.newGroup);
      var device = this.state.selectedDevices[i];
      this._addDeviceToGroup(i, group, device);
    }
  },

  _addDeviceToGroup(idx, group, device) {
    var self = this;
    var callback = {
      success: function() {
        if (idx===self.state.selectedDevices.length-1) {
          // reached end of list
          self.props.changeGroup(group);
          self._toggleDialog();

          if (self.state.isChecked) {
            cookie.save(self.props.user.id+'-groupHelpText', true);
          }
        }
      },
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("Group could not be created: " + err);
      }
    };
    AppActions.addDeviceToGroup(group, device, callback);
  },

  validateName: function(e) {
    var newName = e.target.value;
    this.setState({newGroup: newName});
    var invalid = false;
    var errorText = null;
    if (newName) {
      if (newName === "All devices") {
        invalid = true;
        errorText = 'The group cannot be called "All devices". Try another name';
      } else {
        for (var i=0;i<this.props.groupList.length; i++) {
          if (decodeURIComponent(this.props.groupList[i]) === newName) {
            invalid = true;
            errorText = "A group with this name already exists";
          }
        }
      }
      this.setState({errorText1: errorText, nextInvalid: invalid});
    } else {
      invalid = true;
      errorText = "Name cannot be left blank";
      this.setState({errorText1: errorText, nextInvalid: invalid});
    }
  },

  searchUpdated: function(term) {
    var filter = [{key:'id', value:term}];
    this.setState({searchTerm: filter}); // needed to force re-render
  },

  showDeviceList: function() {
    var numberDevs = this.state.numberDevs || 0;
    numberDevs += 10;
    this.setState({showDeviceList: true, numberDevs: numberDevs});
    this.props.getPickerDevices(numberDevs);
  },

  _onRowSelection: function(array) {
    var selected = [];
    var devices = this._filter(this.props.pickerDevices, this.state.searchTerm);
    var invalid = true;
    if (array === "all") {
      invalid = false;
      for (var i=0;i<devices.length;i++) {
        selected.push(devices[i].id);  
      }
    } else if (array === "none") {
      selected = [];
    } else {
      for (var i=0;i<array.length;i++) {
        selected.push(devices[array[i]].id);  
      }
      invalid = selected.length ? false : true;
    }
    this.setState({selectedDevices: selected, createInvalid: invalid});
  },

  _toggleDialog: function() {
    this.setState({newGroup:'', showDeviceList: false, createInvalid: true, nextInvalid: true, showWarning: false, selectedDevices: []});
    this.props.toggleDialog();
  },
  _filter: function(array, filters) {
    var newArray = [];
    for (var i=0; i<array.length;i++) {
      if (AppStore.matchFilters(array[i], filters)) newArray.push(array[i]);
    }
    return newArray;
  },
  _handleCheckBox: function(event, isChecked) {
    this.setState({isChecked: isChecked});
  },
  render: function() {
    var filteredDevices = this._filter(this.props.pickerDevices, this.state.searchTerm);
    var deviceList = filteredDevices.map(function(device, index) {
      var attributesLength = device.attributes ? device.attributes.length : 0;
      var attrs = {};
      for (var i=0;i<attributesLength;i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }
      var selected = false;
      if (this.state.selectedDevices) {
       selected = this.state.selectedDevices.indexOf(device.id) !== -1;
      }
      return (
        <TableRow key={index} selected={selected}>
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
          onClick={this._toggleDialog} />
      </div>,
      <RaisedButton
        label={this.state.showWarning ? "Confirm" : "Create group"}
        primary={true}
        onClick={this.state.showWarning ? this._addListOfDevices : this._createGroupHandler}
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
            errorText={this.state.errorText1} />

          <div className={this.state.showDeviceList ? "hidden" : "float-left margin-left-small"}>
            <RaisedButton disabled={this.state.nextInvalid} style={{marginTop:"26px"}} label="Next" secondary={true} onClick={this.showDeviceList}/>
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
            <div className="fixedSearch">
              <span>Select devices to include in the new group:</span>
              <SearchInput className="search top-right" ref='search' onChange={this.searchUpdated} placeholder="Search devices" style={{margin:"10px"}} />
            </div>
            <Table
              multiSelectable={true}
              className={deviceList.length ? null : "hidden"}
              onRowSelection={this._onRowSelection}
              selectable={true}>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Device type</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickaway={false}
                showRowHover={true}>
                {deviceList}
              </TableBody>
            </Table>
            {this.props.hasNext ? <a className="small" onClick={this.showDeviceList}>Load more devices</a> : null }
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

module.exports = DevicePicker;