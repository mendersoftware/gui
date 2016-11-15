import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
import SearchInput from 'react-search-input';

// material ui
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Subheader from 'material-ui/Subheader';
require('../common/prototype/Array.prototype.equals');


var tmpDevices = [];
var selectedDevices = [];

var Groups = React.createClass({
  getInitialState: function() {
    return {
      errorText1:'',
      openDialog: false,
      showDeviceList: false,
      newGroup: '',
      nextInvalid: true,
      createInvalid: true,
      selectedDevices: []
    };
  },


  componentDidUpdate: function(prevProps, prevState) {
    if (!prevProps.groupList.equals(this.props.groupList)) {
      this._setNumDevices(this.props.groupList);
    }
  },
  
  _changeGroup: function(group) {
    this.props.changeGroup(group);
  },
  _createGroupHandler: function() {
    var i;
    var callback = {
      success: function() {
        if (i===this.state.selectedDevices.length) {
          this.setState({openDialog: false, showDeviceList: false, createInvalid: true, nextInvalid: true});
          this._changeGroup(this.state.newGroup);
          this.props.refreshGroups();
        }
      }.bind(this),
      error: function(err) {
        console.log(err);
        AppActions.setSnackbar("Group could not be created: " + err);
      }.bind(this)
    };
    for (i=0;i<this.state.selectedDevices.length;i++) {
      AppActions.addDeviceToGroup(encodeURIComponent(this.state.newGroup), this.state.selectedDevices[i], callback);
    }
  },
  dialogToggle: function() {
    this.setState({openDialog: !this.state.openDialog, showDeviceList: false, newGroup: '', nextInvalid: true, createInvalid: true});
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
    this.setState({showDeviceList: true});
  },

  _onRowSelection: function(array) {
    var selected = [];
    var invalid = true;
    if (array === "all") {
      invalid = false;
      for (var i=0;i<tmpDevices.length;i++) {
        selected.push(tmpDevices[i].id);  
      }
    } else if (array === "none") {
      selected = [];
    } else {
      for (var i=0;i<array.length;i++) {
        selected.push(tmpDevices[array[i]].id);  
      }
      invalid = selected.length ? false : true;
    }
    this.setState({selectedDevices: selected, createInvalid: invalid});
  },

  _setNumDevices: function(groupList) {
    var self = this;
    var groups = {};

    for (var i=0;i<groupList.length;i++) {
      groupDevs(i);
    }

    function groupDevs(idx) {
      AppActions.getNumberOfDevices(function(noDevs) {
        groups[groupList[idx]] = {numDevices: noDevs};
        if (idx===groupList.length-1) { self.setState({groupDevs: groups}) }
      }, groupList[idx]);
    }
  },

  render: function() {
    var createBtn = (
      <FontIcon className="material-icons">add</FontIcon>
    );
    var createActions = [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle} />
      </div>,
      <RaisedButton
        label="Create group"
        primary={true}
        onClick={this._createGroupHandler}
        disabled={this.state.createInvalid} />
    ];

    if (this.refs.search && this.props.allDevices.length) {
      var filters = ['id'];
      tmpDevices = this.props.allDevices.filter(this.refs.search.filter(filters));
    }

    var deviceList = tmpDevices.map(function(device, index) {
      var attributesLength = device.attributes ? device.attributes.length : 0;
      var attrs = {};
      for (var i=0;i<attributesLength;i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }
      return (
        <TableRow key={index} selected={this.state.selectedDevices.indexOf(device.id) !== -1}>
          <TableRowColumn>
            {device.id}
          </TableRowColumn>
          <TableRowColumn>
            {attrs.device_type}
          </TableRowColumn>
        </TableRow>
      );
    },this);

    var allLabel = (
      <span>All devices<span className='float-right length'>{this.props.totalDevices}</span></span>
    );

    return (
      <div>
        <List>
          <Subheader>Groups</Subheader>
            <ListItem 
              key="All" 
              primaryText={allLabel}
              style={!this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"}}
              onClick={this._changeGroup.bind(null, "")} />
   
          {this.props.groupList.map(function(group, index) {
            var isSelected = group===this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
            var boundClick = this._changeGroup.bind(null, group);
            var numDevs;
            if (this.state.groupDevs) {
              numDevs = this.state.groupDevs[group] ? this.state.groupDevs[group].numDevices : null;
            }
            var groupLabel = (
                <span>{decodeURIComponent(group)}<span className='float-right length'>{numDevs}</span></span>
            );
            return (
              <ListItem 
                key={group} 
                primaryText={groupLabel}
                style={isSelected}
                onClick={boundClick} />
            )
          }, this)}
           <ListItem 
            leftIcon={createBtn}
            primaryText="Create a group"
            onClick={this.dialogToggle} />
        </List>

        <Dialog
          ref="createGroup"
          title="Create a new group"
          actions={createActions}
          open={this.state.openDialog}
          autoDetectWindowHeight={true} autoScrollBodyContent={true} modal={true}
          bodyClassName="heightTransition"
          bodyStyle={{maxHeight:"50vh"}}
          titleStyle={{paddingBottom: "15px"}}
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
            <p className={deviceList.length ? "hidden" : "italic muted"}>
              No devices match the search term
            </p>
          </div>
        </Dialog>

      </div>
    );
  }
});


module.exports = Groups;