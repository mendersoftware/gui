import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import ReactTooltip from 'react-tooltip';
import { ExpandDevice } from '../helptips/helptooltips';
var Loader = require('../common/loader');
var AppActions = require('../../actions/app-actions');
var ExpandedDevice = require('./expanded-device');
var createReactClass = require('create-react-class');
var pluralize = require('pluralize');

// material ui
var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import InfoIcon from 'react-material-icons/icons/action/info-outline';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';

var Authorized =  createReactClass({
  getInitialState: function() {
    return {
      minHeight: 200,
      divHeight: 178,
      selectedRows: [],
      textfield: this.props.group ? decodeURIComponent(this.props.group) : "All devices",
    }
  },

  componentDidUpdate(prevProps, prevState) {
    var self = this;
    if ((prevProps.allCount !== this.props.allCount) 
        || (prevProps.group !== this.props.group)
        || (prevProps.devices.length !== this.props.devices.length)
        || (prevProps.groupCount !== this.props.groupCount)
        || (prevProps.pageNo !== this.props.pageNo)) {
      this.setState({selectedRows:[], expandRow: null, allRowsSelected: false});
    }

    if ((prevProps.currentTab !== this.props.currentTab) && this.props.currentTab==="Device groups") {
      this.setState({selectedRows:[], expandRow: null});

      if (prevProps.devices.length !== this.props.devices.length) {
         this._adjustHeight();
      }
    }

    if (prevProps.group !== this.props.group) {
      this.setState({textfield: this.props.group ? decodeURIComponent(this.props.group) : "All devices"});
    }

    if ((prevProps.paused !== this.props.paused) && this.state.device) {
      this._setDeviceDetails(this.state.device);
    }
  },


  _adjustHeight: function () {
    // do this when number of devices changes
    var h = this.props.devices.length * 55;
    this.setState({minHeight: h});
  },
  _sortColumn: function(col) {
    console.log("sort");
  },
  _expandRow: function(rowNumber) {
    var self = this;
    AppActions.setSnackbar("");
    var device = this.props.devices[rowNumber];
    if (this.state.expandRow === rowNumber) {
      rowNumber = null;
    }
  
    self.setState({expandRow: rowNumber, device: device});
    self._setDeviceDetails(device);
    
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+85});
  },

   /*
  * Get full device identity details for single selected device
  */
  _setDeviceDetails: function(device) {
    var self = this;
    var callback = {
      success: function(data) {
        device.id_data = data.id_data;
        device.device_id = data.id;
        device.id = data.auth_sets[0].id;
        device.request_time = data.request_time;
        device.status = data.auth_sets[0].status;
        self.setState({expandedDevice: device});
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    };
    var id = device.device_id ? device.device_id : device.id;
    AppActions.getDeviceIdentity(id, callback);
  },



  _onRowSelection: function(selectedRows) {
    if (selectedRows === "all") {
      var rows = Array.apply(null, {length: this.props.devices.length}).map(Number.call, Number);
      this.setState({selectedRows: rows, allRowsSelected: true});
    } else if (selectedRows === "none") {
      this.setState({selectedRows: [], allRowsSelected: false});
    } else {
      this.setState({selectedRows: selectedRows, allRowsSelected: false});
    }
    
  },

  _isSelected: function(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  },

  _getDevicesFromSelectedRows: function() {
    // use selected rows to get device from corresponding position in devices array
    var devices = [];
    for (var i=0; i<this.state.selectedRows.length; i++) {
      devices.push(this.props.devices[this.state.selectedRows[i]]);
    }
    return devices;
  },

  _addToGroup: function () {
    this.props.addDevicesToGroup(this.state.selectedRows);
  },
  _removeFromGroup: function () {
    this.props.removeDevicesFromGroup(this.state.selectedRows);
  },

  _nameEdit: function() {
    if (this.state.nameEdit) {
      this._handleGroupNameSave();
    }
    this.setState({
      nameEdit: !this.state.nameEdit,
      errorText: null
    });
  },

  _handleGroupNameSave: function() {
    // to props - function to get all devices from group, update group one by one
  },

  _handleGroupNameChange: function(event) {
    this.setState({textfield: event.target.value});
  },

  render: function() {

    var pluralized = pluralize("devices", this.state.selectedRows.length); 

    var addLabel = this.props.group ? "Move selected " + pluralized +" to another group" : "Add selected " + pluralized +" to a group";
    var removeLabel =  "Remove selected " + pluralized + " from this group";
    var groupLabel = this.props.group ? decodeURIComponent(this.props.group) : "All devices";

    var styles = {
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "18px" 
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
    };

    var devices = this.props.devices.map(function(device, index) {
      var self = this;
      var expanded = '';
      
      var attrs = {
        device_type: "",
        artifact_name: ""
      };
      var attributesLength = device.attributes ? device.attributes.length : 0; 
      for (var i=0;i<attributesLength;i++) {
        attrs[device.attributes[i].name] = device.attributes[i].value;
      }

      if ( self.state.expandRow === index ) {
        expanded = <ExpandedDevice device={this.state.expandedDevice || device} rejectOrDecomm={this.props.rejectOrDecomm} attrs={device.attributes} device_type={attrs.device_type} styles={this.props.styles} block={this.props.block} accept={this.props.accept} redirect={this.props.redirect} artifacts={this.props.artifacts} selectedGroup={this.props.group} groups={this.props.groups} />
      }
     
      return (
        <TableRow 
          hoverable={!expanded}
          className={expanded ? "expand" : null}
          key={device.device_id || device.id}
          selected={this._isSelected(index)}>
          <TableRowColumn style={expanded ? {height: this.state.divHeight, padding: 0} : {padding: 0}}>
            <div style={styles.paddedCell} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index,0);
            }}>
            {device.device_id || device.id}
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
              {device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : "-" }
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
           
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
              {expanded}
            </Collapse>
         
          </TableRowColumn>
        </TableRow>
      )
    }, this);


    var groupNameInputs = (
      <TextField 
        id="groupNameInput"
        ref="editGroupName"
        value={this.state.textfield}
        onChange={this._handleGroupNameChange}
        onKeyDown={this._handleGroupNameSave}
        className={this.state.nameEdit ? "hoverText" : "hidden"}
        underlineStyle={{borderBottom:"none"}}
        underlineFocusStyle={{borderColor:"#e0e0e0"}}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        errorText={this.state.errorText} />
    );

    var correctIcon = this.state.nameEdit ? "check" : "edit";
    if (this.state.errorText) {
      correctIcon = "close";
    }

    return (
      <div>
        
      <Loader show={this.props.loading} />


    { this.props.devices.length && !this.props.loading ?
      <div>
        <div style={{marginLeft:"26px"}}>
          <h2>
              {groupNameInputs}
              <span className={this.state.nameEdit ? "hidden" : null}>{groupLabel}</span>
              <span className={this.props.group ? 'hidden' : 'hidden'}>
                <IconButton iconStyle={styles.editButton} onClick={this._nameEdit} iconClassName="material-icons" className={this.state.errorText ? "align-top" : null}>
                  {correctIcon}
                </IconButton>
              </span>
          </h2>
        </div>


          <div className="padding-bottom">

            <Table
              allRowsSelected={this.state.allRowsSelected}
              multiSelectable={true}
              onRowSelection={this._onRowSelection}>
              <TableHeader
                className="clickable"
                enableSelectAll={true}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip="ID">ID</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Device type">Device type</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Current software">Current software</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Last heartbeat">Last heartbeat</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{width:"55px", paddingRight:"12px", paddingLeft:"0"}}></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                showRowHover={true}
                deselectOnClickaway={false}
                className="clickable">
                {devices}
              </TableBody>
            </Table>

            { this.props.showHelptips && this.props.devices.length ?
              <div>
                <div 
                  id="onboard-6"
                  className="tooltip help"
                  data-tip
                  data-for='expand-device-tip'
                  data-event='click focus'
                  style={{left: "inherit", right:"45px"}}>
                  <FontIcon className="material-icons">help</FontIcon>
                </div>
                <ReactTooltip
                  id="expand-device-tip"
                  globalEventOff='click'
                  place="left"
                  type="light"
                  effect="solid"
                  className="react-tooltip">
                  <ExpandDevice />
                </ReactTooltip>
              </div>
            : null }

          </div>
          </div>

          :
       
          <div className={(this.props.devices.length || this.props.loading) ? 'hidden' : 'dashboard-placeholder'}>
            <p>
              No devices found
            </p>
            {!this.props.allCount ? <p>No devices have been authorized to connect to the Mender server yet.</p> : null}
          </div>
        }

        <div>

        { this.state.selectedRows.length ? 
          
          <div className="fixedButtons">
            <div className="float-right">
              <span className="margin-right">{this.state.selectedRows.length} {pluralize("devices", this.state.selectedRows.length)} selected</span>
              <RaisedButton disabled={!this.state.selectedRows.length} label={addLabel} secondary={true} onClick={this._addToGroup}>
                <FontIcon style={styles.raisedButtonIcon} className="material-icons">add_circle</FontIcon>
              </RaisedButton>
              <FlatButton disabled={!this.state.selectedRows.length} style={{marginLeft: "4px"}} className={this.props.group ? null : 'hidden'} label={removeLabel} onClick={this._removeFromGroup}>
                <FontIcon style={styles.buttonIcon} className="material-icons">remove_circle_outline</FontIcon>
              </FlatButton>
            </div>
          </div>

        : null }

        </div>


      </div>
    );
  }
});


module.exports = Authorized;