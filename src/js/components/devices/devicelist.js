import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');
var Filters = require('./filters');
var pluralize = require('pluralize');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import Snackbar from 'material-ui/Snackbar';

var DeviceList = React.createClass({
  getInitialState: function() {
    return {
      errorText1: null,
      sortCol: "status",
      sortDown: true,
      addGroup: false,
      autoHideDuration: 5000,
      snackMessage: 'Group has been removed',
      openSnack: false,
      nameEdit: false,
      editValue: null,
      groupName: this.props.selectedGroup,
      divHeight: 148,
      invalid: true,
      groupInvalid: true
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.selectedGroup !== this.props.selectedGroup) {
      this.setState({
        expanded: null,
        groupName: this.props.selectedGroup,
        nameEdit: false
      });
    }
    if (this.state.nameEdit) {
      this.refs.editGroupName.focus();
    }
  },
  
  _onRowSelection: function(selected) {
    AppActions.selectDevices(selected);
  },
  _selectAll: function(rows) {
    console.log("select all", rows);
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
  _handleNewGroupNameChange: function(event) {
   this._validateName(event.target.value);
  },
  _validateName: function(name) {
    var errorText = null;
    var invalid = false;
    if (name === "All devices") {
      errorText = 'The group cannot be called "All devices". Try another name';
      invalid = true;
    }
    else if (name) {
      for (var i=0;i<this.props.groups.length; i++) {
        if (this.props.groups[i] === name) {
          errorText = "A group with this name already exists";
          invalid = true;
        }
      }
    } else {
      errorText = "Name cannot be left blank";
      invalid = true;
    }
    this.setState({errorText1: errorText, invalid: invalid, editValue: name});
  },
  _onChange: function(event) {
    this._validateName(event.target.value);
  },
  _expandRow: function(rowNumber, columnId) {
    
    if (columnId >-1 && columnId < 5) {

      if (this.props.devices[rowNumber] !== this.state.expandedDevice) {
        this._setDeviceIdentity(this.props.devices[rowNumber]);
        this.setState({expandedDevice: this.props.devices[rowNumber]});
      }

      var newIndex = rowNumber;
      if (rowNumber == this.state.expanded) {
        newIndex = null;
      }
      this.setState({expanded: newIndex});
    } else if (rowNumber === "all" || rowNumber ===  "none") {
      this._onRowSelection(rowNumber);
    } else if (columnId === -1) {
      this._onRowSelection(this.props.devices[rowNumber]);
    }
  },
  _setDeviceIdentity: function(device) {
    var callback = {
      success: function(data) {
        this.setState({deviceAttributes: data.attributes, deviceId: data.id, admittanceTime: null});
      }.bind(this),
      error: function(err) {
        console.log("Error: " + err);
      }
    };
    AppActions.getDeviceIdentity(device.id, callback);
  },
  _addGroupHandler: function() {
    var i;
    var callback = {
      success: function(device) {
        this.setState({openSnack: true, snackMessage: "Device was moved to " + this.props.selectedField});
        if (i===this.props.selectedDevices.length) this._doneAddingGroup();
      }.bind(this),
      error: function(err) {
        this.setState({openSnack: true, snackMessage: "Error moving device into group " + this.props.selectedField});
        console.log("Error: " + err);
      }
    };
    var groupEncode = encodeURIComponent(this.props.selectedField);
    for (i=0; i<this.props.selectedDevices.length; i++) {
      AppActions.addDeviceToGroup(groupEncode, this.props.selectedDevices[i], callback);
    }
    this.dialogToggle('addGroup');
  },
  _doneAddingGroup: function() {
    AppActions.selectGroup(this.props.selectedField);
    this.props.refreshGroups();
  },
  _removeFromGroupHandler: function(devices) {
    var i;
    var length = devices.length;
    var callback = {
      success: function(result) {
        if (i===length) {
          if (length === this.props.devices.length) {
             AppActions.selectGroup("");
            this.props.refreshGroups();
          } else {
            this.props.refreshDevices();
          }
        }
      }.bind(this),
      error: function(err) {
        console.log(err);
      }
    };
    for (i=0;i<length;i++) {
      AppActions.removeDeviceFromGroup(devices[i], this.props.selectedGroup, callback);
    }
  },
  _removeSelectedDevices: function() {
    this._removeFromGroupHandler(this.props.selectedDevices);
  },
  _removeCurrentGroup: function() {
    var devices = [];
    for (var i=0;i<this.props.devices.length;i++) {
      devices.push(this.props.devices[i].id);
    }
    this._removeFromGroupHandler(devices);
  },

  _newGroupHandler: function() {
    var newGroup = this.refs['customGroup'].getValue();
    this.props.addGroup(newGroup);
    this.setState({groupInvalid: newGroup ? false : true, showInput: false});
  },
  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    state.selectedField = "";
    state.editValue = "";
    this.setState(state);
  },
  _handleSelectValueChange: function(event, index, value) {
    this.setState({showInput: false, groupInvalid: false});
    this.props.changeSelect(value);
  },

  _showButton: function() {
    this.setState({showInput: true, editValue: ""});
    this.refs.customGroup.focus();
  },

  _sortColumn: function(col) {
    var direction;
    if (this.state.sortCol !== col) {
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons";
      ReactDOM.findDOMNode(this.refs[col]).className = "sortIcon material-icons selected";
      this.setState({sortCol:col, sortDown: true});
      direction = true;
    } else {
      direction = !(this.state.sortDown);
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons selected " +direction;
      this.setState({sortDown: direction});
    }
    // sort table
    AppActions.sortTable("_currentDevices", col, direction);
  },

  handleRequestClose: function() {
    this.setState({
      openSnack: false,
    });
  },

  handleUndoAction: function() {
    AppActions.addGroup(this.state.tempGroup, this.state.tempIdx);
    this.handleRequestClose();
  },

  _nameEdit: function() {
    if (this.state.nameEdit) {
      this._handleGroupNameSave();
    }
    this.setState({
      nameEdit: !this.state.nameEdit,
      errorText1: null
    });
  },

  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+60});
  },

  _cancelAdd: function() {
    this.dialogToggle('addGroup');
    this.props.refreshGroups();
  },

  _filter: function(array) {
    var newArray = [];
    for (var i=0; i<array.length;i++) {
      if (AppStore.matchFilters(array[i])) newArray.push(array[i]);
    }
    return newArray;
  },

  render: function() {
    var styles = {
      exampleFlatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6px",
        color:"#679BA5",
        fontSize:'16px'
      },
      exampleFlatButton: {
        fontSize:'12px',
        marginLeft:"10px",
        float:"right",
        marginRight:"130px"
      },
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20px" 
      },
      buttonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6px",
        color: "rgb(0, 188, 212)"
      },
      raisedButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6px",
        color: "#fff"
      },
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10px",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }

    var groupList = this.props.groups.map(function(group, index) {
      if (group) {
        return <MenuItem value={group} key={index} primaryText={decodeURIComponent(group)} />
      }
    });

    var filteredDevices = this._filter(this.props.devices);

    var devices = filteredDevices.map(function(device, index) {
      var expanded = '';
      var attrs = {
        device_type: "",
        artifact_name: ""
      };
      var attributesLength = device.attributes ? device.attributes.length : 0; 
      for (var i=0;i<attributesLength;i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }
      if ( this.state.expanded === index ) {
        expanded = <SelectedDevices redirect={this.props.redirect} admittanceTime={this.state.admittanceTime} attributes={this.state.deviceAttributes} deviceId={this.state.deviceId} device_type={attrs.device_type} artifacts={this.props.artifacts} device={this.state.expandedDevice} selectedGroup={this.props.selectedGroup} artifacts={this.props.artifacts} groups={this.props.groups} />
      }
      return (
        <TableRow selected={device.selected} hoverable={!expanded} className={expanded ? "expand" : null}  key={index}>
          <TableRowColumn style={expanded ? {height: this.state.divHeight} : null}>{device.id}</TableRowColumn>
          <TableRowColumn>{attrs.device_type || "-"}</TableRowColumn>
          <TableRowColumn>{attrs.artifact_name || "-"}</TableRowColumn>
          <TableRowColumn><Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{width:"55px", paddingRight:"0", paddingLeft:"12px"}} className="expandButton">
            <IconButton className="float-right"><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
           
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}>
              {expanded}
            </Collapse>
         
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    var disableAction = this.props.selectedDevices.length ? false : true;
    
    var addActions = [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this._cancelAdd} />
      </div>,
      <RaisedButton
        label="Add to group"
        primary={true}
        onClick={this._addGroupHandler}
        ref="save" 
        disabled={this.state.groupInvalid} />
    ];

    var groupNameInputs = (
      <TextField 
        id="groupNameInput"
        ref="editGroupName"
        value={this.state.groupName || ""}
        onChange={this._handleGroupNameChange}
        onKeyDown={this._handleGroupNameSave}
        className={this.state.nameEdit ? "hoverText" : "hidden"}
        underlineStyle={{borderBottom:"none"}}
        underlineFocusStyle={{borderColor:"#e0e0e0"}}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        errorText={this.state.errorText1} />
    );

    var correctIcon = this.state.nameEdit ? "check" : "edit";
    if (this.state.errorText1) {
      correctIcon = "close";
    }

    var pluralized = pluralize("devices", this.props.selectedDevices.length); 
    var addLabel = this.props.selectedGroup ? "Move selected " + pluralized +" to another group" : "Add selected " + pluralized +" to a group";
    var removeLabel =  "Remove selected " + pluralized +" from this group";
    var groupLabel = this.props.selectedGroup ? decodeURIComponent(this.props.selectedGroup) : "All devices";

    return (
      <div>
        <Filters attributes={this.props.attributes} filters={this.props.filters} onFilterChange={this.props.onFilterChange} />

        <div className="margin-top-small">
          <div style={{marginLeft:"26px"}}>
            <h2 style={{marginTop:"15px"}}>
             
                {groupNameInputs}
                <span className={this.state.nameEdit ? "hidden" : null}>{groupLabel}</span>
                <span className={this.props.selectedGroup ? "hidden" : 'hidden'}>
                  <IconButton iconStyle={styles.editButton} onClick={this._nameEdit} iconClassName="material-icons" className={this.state.errorText1 ? "align-top" : null}>
                    {correctIcon}
                  </IconButton>
                </span>

                <FlatButton onClick={this._removeCurrentGroup} style={styles.exampleFlatButton} className={this.props.selectedGroup ? null : 'hidden' } secondary={true} label="Remove group" labelPosition="after">
                  <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">delete</FontIcon>
                </FlatButton>
            </h2>
          </div>
          <div className="margin-bottom">
            <Table
              onCellClick={this._expandRow}
              onRowSelection={this._expandRow}
              multiSelectable={true}
              className={devices.length ? null : 'hidden'} >
              <TableHeader
              enableSelectAll={true}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip="Name">Name<FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Device type">Device type<FontIcon ref="device_type" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "device_type")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Current software">Current software<FontIcon ref="artifact_name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "artifact_version")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Last heartbeat">Last heartbeat<FontIcon ref="last_heartbeat" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "last_heartbeat")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{width:"55px", paddingRight:"12px", paddingLeft:"0"}}></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickaway={false}
                showRowHover={true}
                className="clickable">
                {devices}
              </TableBody>
            </Table>

            <div className={(devices.length || this.props.loading) ? 'hidden' : 'dashboard-placeholder'}>
              <p>
                No devices found
              </p>
            </div>
          </div>

          <div className={this.props.selectedDevices.length ? "fixedButtons" : "hidden"}>
            <span className="margin-right">{this.props.selectedDevices.length} {pluralized} selected</span>
            <RaisedButton disabled={disableAction} label={addLabel} secondary={true} onClick={this.dialogToggle.bind(null, 'addGroup')}>
              <FontIcon style={styles.raisedButtonIcon} className="material-icons">add_circle</FontIcon>
            </RaisedButton>
            <FlatButton disabled={disableAction} style={{marginLeft: "4px"}} className={this.props.selectedGroup ? null : 'hidden'} label={removeLabel} secondary={true} onClick={this._removeSelectedDevices}>
              <FontIcon style={styles.buttonIcon} className="material-icons">remove_circle_outline</FontIcon>
            </FlatButton>
          </div>

        </div>

        <Dialog
          open={this.state.addGroup}
          title="Add selected devices to group"
          actions={addActions}
          autoDetectWindowHeight={true}>  
          <div style={{height: '200px'}}>
            <div className={groupList.length ? "float-left" : "hidden"}>
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

            <div className={this.state.showInput || !groupList.length ? null : 'hidden'}>
              <TextField
                ref="customGroup"
                hintText="Group name"
                value={this.state.editValue || ""}
                floatingLabelText="Group name"
                className="float-left clear"
                onChange={this._handleNewGroupNameChange}
                errorStyle={{color: "rgb(171, 16, 0)"}}
                errorText={this.state.errorText1} />
              <div className="float-left margin-left-small">
                <RaisedButton
                  style={{marginTop:"26px"}}
                  secondary={true}
                  label="Save"
                  onClick={this._newGroupHandler}
                  disabled={this.state.invalid} />
              </div>
            </div>
          </div>
        </Dialog>

        <Snackbar
          open={this.state.openSnack}
          message={this.state.snackMessage}
          autoHideDuration={this.state.autoHideDuration}
          onActionTouchTap={this.handleUndoAction}
          onRequestClose={this.handleRequestClose}
        />

      </div>
    );
  }
});

module.exports = DeviceList;