import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import { ShortSHA, fullyDecodeURI } from '../../helpers';

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');
var GroupSelector = require('./groupselector');
var Filters = require('./filters');
var pluralize = require('pluralize');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
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
      autoHideDuration: 8000,
      snackMessage: 'Group has been removed',
      openSnack: false,
      nameEdit: false,
      groupName: this.props.selectedGroup,
      divHeight: 148,
      groupInvalid: true,
      selectedRows: []
    };
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.selectedGroup !== this.props.selectedGroup) {
      this.tableBody.setState({ selectedRows: [] });
      this.setState({
        selectedRows: [],
        expanded: null,
        groupName: this.props.selectedGroup,
        nameEdit: false
      });
    }
    if (prevProps.page !== this.props.page) {
      // close expanded details when pagination changes
      this.setState({expanded: null});
    }
    if (this.state.nameEdit) {
      this.refs.editGroupName.focus();
    }
  },
  
  _onRowSelection: function(selected) {
    if (selected === "all" || selected === "none") {
      var devices = this._filter(this.props.devices);
      var deviceArray = (selected === "all") ? Array.from(Array(devices.length).keys()) : [];
      this.tableHeader.setState({ selectedRows: deviceArray });
      this.setState({selectedRows: deviceArray});
    } else {
      this.tableHeader.setState({ selectedRows: selected });
      this.setState({selectedRows: selected});
    }
  },
 
  _expandRow: function(rowNumber, columnId) {
    if (columnId>-1 && columnId<5) {
      //clear interval for inventory details check
      clearInterval(this.inventoryInterval);
      var clickedDevice = this.props.devices[rowNumber].id;
      var currentExpanded = this.state.expandedDevice ? this.state.expandedDevice.id : null;
      // check device is not already expanded
      if (clickedDevice !== currentExpanded) {
        this._setDeviceIdentity(this.props.devices[rowNumber]);
        this.setState({expandedDevice: this.props.devices[rowNumber]});

        // set interval to update inventory details in child when received
        this.inventoryInterval = setInterval(function() {
          this.setState({expandedDevice: this.props.devices[rowNumber]});
        }.bind(this), 5000);
      }

      var newIndex = rowNumber;
      if (rowNumber == this.state.expanded) {
        newIndex = null;
      }
      this.setState({expanded: newIndex});
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
    var group = this.state.tmpGroup || this.props.selectedField;
    var devices = this._filter(this.props.devices);
    for (i=0; i<this.state.selectedRows.length; i++) {
      this._addSingleDevice(i, this.state.selectedRows.length, devices[this.state.selectedRows[i]].id, group);
    }
    this.dialogToggle('addGroup');
  },
  _removeFromGroupHandler: function(selectedRows) {
    var devices = this._filter(this.props.devices);
    for (var i=0;i<selectedRows.length;i++) {
      this._removeSingleDevice(i, selectedRows.length, devices[selectedRows[i]].id);
    }
  },
  _addSingleDevice: function(idx, length, device, group) {
    var self = this;
    group = fullyDecodeURI(group);
    var groupEncode = encodeURIComponent(group);

    var callback = {
      success: function(device) {
        self.setState({openSnack: true, snackMessage: "Device was moved to " + group});
        if (idx===length-1) {
          self.props.groupsChanged(group);
          self.tableBody.setState({ selectedRows: []});
        }
      },
      error: function(err) {
        self.setState({openSnack: true, snackMessage: "Error moving device into group " + group});
        console.log("Error: " + err);
      }
    };
    AppActions.addDeviceToGroup(groupEncode, device, callback);
  },
  _removeSingleDevice: function(idx, length, device) {
    var self = this;
    var callback = {
      success: function(result) {
        if (idx===length-1) {
          if (length === self.props.devices.length) {
            self.props.groupsChanged();
            self.setState({openSnack: true, snackMessage: "The group was removed"});
          } else {
            self.props.groupsChanged(self.props.selectedGroup);
            self.setState({openSnack: true, snackMessage: "Device was removed from the group", selectedRows: []});
            self.tableBody.setState({ selectedRows: [] });
          }
        }
      },
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.removeDeviceFromGroup(device, this.props.selectedGroup, callback);
  },

  _removeSelectedDevices: function() {
    this._removeFromGroupHandler(this.state.selectedRows);
  },
  _removeCurrentGroup: function() {
    var devices = [];
    for (var i=0;i<this.props.devices.length;i++) {
      devices.push(this.props.devices[i].id);
    }
    this._removeFromGroupHandler(devices);
  },

  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
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
  },

  _filter: function(array) {
    var newArray = [];
    for (var i=0; i<array.length;i++) {
      if (AppStore.matchFilters(array[i])) newArray.push(array[i]);
    }
    return newArray;
  },

  _validate: function(invalid, group) {
    var name = invalid ? "" : group;
    this.setState({groupInvalid: invalid, tmpGroup: name});
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
      },
      paddedCell: {
        height: "100%",
        padding: "16px 24px",
        width: "100%"
      }
    }

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
        expanded = <SelectedDevices addTooltip={this.props.addTooltip} redirect={this.props.redirect} admittanceTime={this.state.admittanceTime} attributes={this.state.deviceAttributes} deviceId={this.state.deviceId} device_type={attrs.device_type} artifacts={this.props.artifacts} device={this.state.expandedDevice} selectedGroup={this.props.selectedGroup} artifacts={this.props.artifacts} groups={this.props.groups} />
      }
      return (
        <TableRow hoverable={!expanded} className={expanded ? "expand" : null} key={device.id}>
          <TableRowColumn style={expanded ? {height: this.state.divHeight, padding: 0} : {padding: 0}}>
            <div style={styles.paddedCell} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,0);
            }}>
            {ShortSHA(device.id)}
            </div>
          </TableRowColumn>
          <TableRowColumn style={{padding: 0}}>
            <div style={styles.paddedCell} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,1);
            }}>
            {attrs.device_type || "-"}
            </div>
          </TableRowColumn>
          <TableRowColumn style={{padding: 0}}>
            <div style={styles.paddedCell} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,2);
            }}>
            {attrs.artifact_name || "-"}
            </div>
          </TableRowColumn>
          <TableRowColumn style={{padding: 0}}>
            <div style={styles.paddedCell} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,3);
            }}>
              <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn style={{width:"55px", paddingRight:"0", paddingLeft:"12px"}} className="expandButton">
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,4);
            }}>
              <IconButton className="float-right"><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
            </div>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
           
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}>
              {expanded}
            </Collapse>
         
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    var disableAction = this.state.selectedRows.length ? false : true;
    
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

    var pluralized = pluralize("devices", this.state.selectedRows.length); 
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
              multiSelectable={true}
              className={devices.length ? null : 'hidden'}
              onRowSelection={this._onRowSelection} >
              <TableHeader
              className="clickable"
              enableSelectAll={true}
              ref={(tableHeader) => { this.tableHeader = tableHeader; }}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip="ID">ID<FontIcon ref="id" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "id")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Device type">Device type<FontIcon ref="device_type" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "device_type")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Current software">Current software<FontIcon ref="artifact_name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "artifact_version")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Last heartbeat">Last heartbeat<FontIcon ref="last_heartbeat" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "last_heartbeat")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{width:"55px", paddingRight:"12px", paddingLeft:"0"}}></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickaway={false}
                preScanRows={false}
                showRowHover={true}
                className="clickable"
                ref={(tableBody) => { this.tableBody = tableBody; }}>
                {devices}
              </TableBody>
            </Table>

            <div className={(devices.length || this.props.loading) ? 'hidden' : 'dashboard-placeholder'}>
              <p>
                No devices found
              </p>
            </div>
          </div>

          <div className={this.state.selectedRows.length ? "fixedButtons" : "hidden"}>
            <span className="margin-right">{this.state.selectedRows.length} {pluralized} selected</span>
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
          <GroupSelector changeSelect={this.props.changeSelect} validateName={this._validate} groups={this.props.groups} selectedField={this.props.selectedField} />
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