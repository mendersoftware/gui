import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import { ShortSHA } from '../../helpers';
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');
var pluralize = require('pluralize');

// material ui
var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

var Authorized =  React.createClass({
  getInitialState: function() {
    return {
       sortCol: "name",
       sortDown: true,
       minHeight: 180,
       divHeight: 178,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    var h = nextProps.pending.length * 50;
    h += 135;
    this.setState({minHeight: h});
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
    AppActions.sortTable("_pendingDevices", col, direction);
  },
  _authorizeDevices: function(devices) {
  
    var self = this;

    this.props.showLoader(true);

    // make into chunks of 5 devices
    var arrays = [], size = 5;
    var deviceList = devices.slice();
    while (deviceList.length > 0) {
      arrays.push(deviceList.splice(0, size));
    }
    
    var i = 0;
    var success = 0;
    var loopArrays = function(arr) {
      self.props.pauseRefresh(true);

      // for each chunk, authorize one by one
      self._authorizeBatch(arr[i], function(num) {
        success = success+num;
        i++;
        if (i < arr.length) {
          loopArrays(arr);   
        } else {
          setTimeout(function() {
            AppActions.setSnackbar(success + " " + pluralize("devices", success) + " " + pluralize("were", success) + " authorized");
          }, 2000);
          self.props.refresh();
          self.props.refreshAdmissions();
          self.props.showLoader(false);
          self.props.pauseRefresh(false);
        }
      });
    }

    loopArrays(arrays);
    
  },
  _authorizeBatch(devices, callback) {
    // authorize one by one, callback when finished
    var i = 0;
    var fail = 0;
    var singleCallback = {
      success: function(data) {
        i++;
        if (i===devices.length) {
          callback(i);
        }
      }.bind(this),
      error: function(err) {
        fail++;
        i++;
        AppActions.setSnackbar("There was a problem authorizing the device: "+err);
        if (i===devices.length) {
          callback(i-fail);
        }
      }
    };

    devices.forEach( function(device, index) {
      AppActions.acceptDevice(device, singleCallback);
    });
  },
  _expandRow: function(rowNumber, columnId, event) {
    event.stopPropagation();
    // If action buttons column, no expand
    if (columnId === 4) {
      this.props.expandRow(null);
    } else if (columnId < 5){
      var device = this.props.pending[rowNumber];
      device.id_data = device.attributes;
      this.setState({expandedDevice: device});
      this.props.expandRow(rowNumber);
    }
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+70});
  },
  _blockDevice: function(device) {
    this.props.block(device);
  },
  render: function() {
    var devices = this.props.pending.map(function(device, index) {
      var expanded = '';
      if ( this.props.expandedAdmRow === index ) {
        expanded = <SelectedDevices styles={this.props.styles} addTooltip={this.props.addTooltip} attributes={device.attributes} deviceId={this.state.deviceId} accept={this._authorizeDevices} block={this.props.block} device={this.state.expandedDevice} unauthorized={true} selected={[device]}  />
      }
      return (
        <TableRow style={{"backgroundColor": "#e9f4f3"}} className={expanded ? "expand" : null} hoverable={true} key={index}>
          <TableRowColumn style={expanded ? {height: this.state.divHeight} : null}>{ShortSHA(device.id)}</TableRowColumn>
          <TableRowColumn><Time value={device.request_time} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
          <TableRowColumn className="expandButton" style={{"paddingLeft": "12px"}}>
            <IconButton onClick={this._authorizeDevices.bind(null, [device])}>
              <FontIcon className="material-icons green">check_circle</FontIcon>
            </IconButton>
            <IconButton onClick={this._blockDevice.bind(null, device)}>
              <FontIcon className="material-icons red">cancel</FontIcon>
            </IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
  
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}>
              {expanded}
            </Collapse>

          </TableRowColumn>
        </TableRow>
      )
    }, this);

    return (
      <Collapse springConfig={{stiffness: 190, damping: 20}} style={{minHeight:this.state.minHeight}} isOpened={true} className="margin-top authorize">
        <p>{this.props.total} {pluralize("devices", devices.length)} pending authorization</p>
        <Table
          selectable={false}
          className="unauthorized"
          onCellClick={this._expandRow}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false} 
          >
            <TableRow>
              <TableHeaderColumn className="columnHeader" tooltip="ID">ID<FontIcon ref="id" style={this.props.styles.sortIcon} onClick={this._sortColumn.bind(null, "id")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
              <TableHeaderColumn className="columnHeader" tooltip="Request time">Request time<FontIcon ref="request_time" style={this.props.styles.sortIcon} onClick={this._sortColumn.bind(null, "request_time")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
              <TableHeaderColumn className="columnHeader" tooltip="Status">Status<FontIcon ref="status" style={this.props.styles.sortIcon} onClick={this._sortColumn.bind(null, "status")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
              <TableHeaderColumn className="columnHeader" tooltip="Authorize device?">Authorize?</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            showRowHover={true}
            className="clickable">
            {devices}
          </TableBody>
        </Table>

        <RaisedButton onClick={this._authorizeDevices.bind(null, this.props.pending)} primary={true} label={"Authorize " + devices.length +" " + pluralize("devices", devices.length)} style={{position:"absolute", bottom: "15px", right:"15px"}} />
      </Collapse>
    );
  }
});


module.exports = Authorized;