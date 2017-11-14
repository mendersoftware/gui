import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import ReactTooltip from 'react-tooltip';
import { AuthDevices, ExpandAuth, AuthButton } from '../helptips/helptooltips';
var Loader = require('../common/loader');
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');
var pluralize = require('pluralize');
var createReactClass = require('create-react-class');

// material ui
var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import InfoIcon from 'react-material-icons/icons/action/info-outline';

var Authorized =  createReactClass({
  getInitialState: function() {
    return {
       sortCol: "name",
       sortDown: true,
       minHeight: 180,
       divHeight: 178,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    var h = nextProps.pending.length * 55;
    h += 100;
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
  _expandRow: function(rowNumber, columnId, event) {
    event.stopPropagation();
    // If action buttons column, no expand
    if (columnId === 3) {
      this.props.expandRow(null);
    } else if (columnId < 4){
      var device = this.props.pending[rowNumber];
      device.id_data = device.attributes;
      this.setState({expandedDevice: device});
      this.props.expandRow(rowNumber);
    }
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+65});
  },
  _authorizeDevices: function(devices, index) {
    this.props.authorizeDevices(devices);
    if (index !== null) {
      this.setState({authLoading: index});
    } else {
      this.setState({authLoading: "all"});
    }
  },
  _blockDevice: function(device, index) {
    this.props.block(device);
    this.setState({blockLoading: index});
  },
  render: function() {
    var limitMaxed = this.props.deviceLimit && (this.props.deviceLimit <= this.props.totalDevices);
    var limitNear = this.props.deviceLimit && (this.props.deviceLimit < this.props.totalDevices + this.props.pending.length );

    var devices = this.props.pending.map(function(device, index) {
      var expanded = '';
      if ( this.props.expandedAdmRow === index ) {
        expanded = <SelectedDevices disabled={limitMaxed} styles={this.props.styles} attributes={device.attributes} deviceId={this.state.deviceId} accept={this.props.authorizeDevices} block={this.props.block} device={this.state.expandedDevice} unauthorized={true} selected={[device]}  />
      }
      var checkIcon = (this.state.authLoading === index && this.props.disabled) ?
        (
          <div className="inline-block">
            <Loader table={true} waiting={true} show={true} />
          </div>
        ) : 
        (
          <IconButton disabled={this.props.disabled || limitMaxed} onClick={this._authorizeDevices.bind(null, [device], index)}>
              <FontIcon className="material-icons green">check_circle</FontIcon>
          </IconButton>
        )
      ;
      var deleteIcon = (this.state.blockLoading === index && this.props.disabled) ?
        (
          <div className="inline-block">
            <Loader table={true} waiting={true} show={true} />
          </div>
        ) : 
        (
          <IconButton disabled={this.props.disabled} onClick={this._blockDevice.bind(null, device, index)}>
            <FontIcon className="material-icons red">cancel</FontIcon>
          </IconButton>
        )
      ;
      return (
        <TableRow style={{"backgroundColor": "#e9f4f3"}} className={expanded ? "expand" : null} hoverable={true} key={index}>
          <TableRowColumn style={expanded ? {height: this.state.divHeight} : null}>{device.id}</TableRowColumn>
          <TableRowColumn><Time value={device.request_time} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
          <TableRowColumn className="expandButton" style={{"paddingLeft": "12px"}}>
            {checkIcon}
            {deleteIcon}
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
  
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}>
              {expanded}
            </Collapse>

          </TableRowColumn>
        </TableRow>
      )
    }, this);
    
    var deviceLimitWarning = (limitMaxed || limitNear) ?
      (
        <p className="warning">
          <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
          <span className={limitMaxed ? null : "hidden"}>You have reached</span><span className={limitNear&&!limitMaxed ? null : "hidden"}>You are nearing</span> your limit of authorized devices: {this.props.totalDevices} of {this.props.deviceLimit}
        </p>
    ) : null;

    var minHeight = deviceLimitWarning ? this.state.minHeight + 20 : this.state.minHeight;
    return (
      <Collapse springConfig={{stiffness: 190, damping: 20}} style={{minHeight:minHeight}} isOpened={true} id="authorize" className="margin-top-small authorize">
        
       {deviceLimitWarning}

        <p>{this.props.total} {pluralize("devices", devices.length)} pending authorization</p>

        { this.props.showHelptips ?
          <div>
            <div 
              id="onboard-2"
              className={this.props.highlightHelp ? "tooltip help highlight" : "tooltip help"}
              data-tip
              data-for='review-devices-tip'
              data-event='click focus'>
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip
              id="review-devices-tip"
              globalEventOff='click'
              place="bottom"
              type="light"
              effect="solid"
              className="react-tooltip">
              <AuthDevices devices={devices.length} />
            </ReactTooltip>
          </div>
        : null }

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
            preScanRows={false}
            className="clickable">
            {devices}
          </TableBody>

        </Table>


        { this.props.showHelptips && devices.length ?
          <div>
            <div 
              id="onboard-3"
              className="tooltip help"
              data-tip
              data-for='expand-auth-tip'
              data-event='click focus'
              style={{left:"10%"}}>
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip
              id="expand-auth-tip"
              globalEventOff='click'
              place="bottom"
              type="light"
              effect="solid"
              className="react-tooltip">
              <ExpandAuth />
            </ReactTooltip>
          </div>
        : null }

        <div style={{position:"absolute", bottom: "15px", right:"15px"}}>

          {
            (this.state.authLoading === "all" && this.props.disabled) ?
                 <div style={{width:"150px", position: "absolute", left: "-150px", top: "15px"}} className="inline-block">
                    <Loader table={true} waiting={true} show={true} />
                </div>
            :
            null
          }
     
          <div className="align-right">
            {deviceLimitWarning}
            <RaisedButton disabled={this.props.disabled || limitMaxed || limitNear} onClick={this._authorizeDevices.bind(null, this.props.pending, null)} primary={true} label={"Authorize " + devices.length +" " + pluralize("devices", devices.length)} />
          </div>

          { this.props.showHelptips && devices.length ?
            <div>
              <div 
                id="onboard-4"
                className={this.props.highlightHelp ? "tooltip help highlight" : "tooltip help"}
                data-tip
                data-for='auth-button-tip'
                data-event='click focus'>
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip
                id="auth-button-tip"
                globalEventOff='click'
                place="bottom"
                type="light"
                effect="solid"
                className="react-tooltip">
                <AuthButton devices={devices.length} />
              </ReactTooltip>
            </div>
          : null }


        </div>
      </Collapse>
    );
  }
});


module.exports = Authorized;