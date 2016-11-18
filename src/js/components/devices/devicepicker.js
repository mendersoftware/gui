import React from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import SearchInput from 'react-search-input';
var AppActions = require('../../actions/app-actions');
var Loader = require('../common/loader');

var DevicePicker = React.createClass({

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
          self.props.changeGroup(group);
          self._toggleDialog();
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
    this.setState({searchTerm: term}); // needed to force re-render
  },

  showDeviceList: function() {
    var numberDevs = this.state.numberDevs || 0;
    numberDevs += 10;
    this.setState({showDeviceList: true, numberDevs: numberDevs});
    this.props.getPickerDevices(numberDevs);
  },

  _onRowSelection: function(array) {
    var selected = [];
    var invalid = true;
    if (array === "all") {
      invalid = false;
      for (var i=0;i<this.props.pickerDevices.length;i++) {
        selected.push(this.props.pickerDevices[i].id);  
      }
    } else if (array === "none") {
      selected = [];
    } else {
      for (var i=0;i<array.length;i++) {
        selected.push(this.props.pickerDevices[array[i]].id);  
      }
      invalid = selected.length ? false : true;
    }
    this.setState({selectedDevices: selected, createInvalid: invalid});
  },

  _toggleDialog: function() {
    this.setState({newGroup:'', showDeviceList: false, createInvalid: true, nextInvalid: true});
    this.props.toggleDialog();
  },
  render: function() {
    var deviceList = this.props.pickerDevices.map(function(device, index) {
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
        label="Create group"
        primary={true}
        onClick={this._createGroupHandler}
        disabled={this.state.createInvalid} />
    ];

    return (
      <Dialog
        ref="createGroup"
        title="Create a new group"
        actions={createActions}
        open={this.props.open}
        autoDetectWindowHeight={true} autoScrollBodyContent={true} modal={true}
        bodyClassName="heightTransition"
        bodyStyle={{maxHeight:"50vh"}}
        titleStyle={{paddingBottom: "15px", marginBottom:0}}
        footerStyle={{marginTop:0}}
        >  

        <div className={this.state.showDeviceList ? "hidden" : "absoluteTextfieldButton" }>
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
      </Dialog>
    )
  }
});

module.exports = DevicePicker;