import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import ReactTooltip from 'react-tooltip';
import { AuthDevices, ExpandAuth } from '../helptips/helptooltips';
import { Router, Link } from 'react-router';
var Loader = require('../common/loader');
var AppActions = require('../../actions/app-actions');
var AppStore = require('../../stores/app-store');
var ExpandedDevice = require('./expanded-device');
var createReactClass = require('create-react-class');
var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var pluralize = require('pluralize');
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { preformatWithRequestID } from '../../helpers.js';


// material ui
var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import InfoIcon from 'react-material-icons/icons/action/info-outline';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';

var Pending =  createReactClass({
  getInitialState: function() {
    return {
      minHeight: 230,
      divHeight: 208,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      authLoading: "all",
      deviceToReject: {},
      openReject: false,
    }
  },

  componentDidMount() {
    clearAllRetryTimers();
    this._getDevices();
  },

  componentWillUnmount() {
    clearAllRetryTimers();
  },

  componentDidUpdate(prevProps, prevState) {

    if ((prevProps.count !== this.props.count)
      || ((prevProps.currentTab !== this.props.currentTab) && (this.props.currentTab.indexOf("Pending")!==-1)) ) {
      this._getDevices();
    }

  },


  /*
  * Devices to show
  */ 
  _getDevices: function() {
    var self = this;
    var callback =  {
      success: function(devices) {
        self.setState({devices: devices, pageLoading: false, authLoading: null, rejectLoading: null, deviceToReject:{}, openReject: false, expandRow: null});
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
        self._adjustHeight();
      },
      error: function(error) {
        console.log(err);
        var errormsg = err.error || "Please check your connection.";
        self.setState({pageLoading: false, authLoading: null, rejectLoading: null, deviceToReject:{}, openReject: false });
        setRetryTimer(err, "devices", "Pending devices couldn't be loaded. " + errormsg, self.state.refreshDeviceLength);
      }
    };
    AppActions.getDevicesByStatus(callback, "pending", this.state.pageNo, this.state.pageLength);
  },

  _adjustHeight: function () {
    // do this when number of devices changes
    var h = this.state.devices.length * 55;
    h += 200;
    this.setState({minHeight: h});
  },
  _sortColumn: function(col) {
    console.log("sort");
  },
  _expandRow: function(rowNumber) {
    AppActions.setSnackbar("");
    var device = this.state.devices[rowNumber];
    if (this.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    this.setState({expandedDevice: device, expandRow: rowNumber});
    
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+95});
  },

  _handlePageChange: function(pageNo) {
    var self = this;
    self.setState({currentPage: pageNo, pageLoading:true, expandRow: null, pageNo: pageNo}, () => {self._getDevices()});
  },

  render: function() {
    var limitMaxed = this.props.deviceLimit ? (this.props.deviceLimit <= this.props.acceptedDevices) : false;
    var limitNear = this.props.deviceLimit ? (this.props.deviceLimit < (this.props.acceptedDevices + this.state.devices.length) ) : false;

    var devices = this.state.devices.map(function(device, index) {
      var self = this;
      var expanded = '';

      var id_attribute  = (self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== "Device ID") 
        ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
        : device.id;


      if ( self.state.expandRow === index ) {
        expanded = <ExpandedDevice 
                    highlightHelp={self.props.highlightHelp}
                    showHelptips={self.props.showHelptips} 
                    id_attribute={(self.props.globalSettings || {}).id_attribute} 
                    id_value={id_attribute}
                    _showKey={self._showKey} 
                    showKey={self.state.showKey} 
                    limitMaxed={limitMaxed} 
                    styles={self.props.styles} 
                    deviceId={self.state.deviceId} 
                    device={self.state.expandedDevice} 
                    unauthorized={true} 
                    pause={self.props.pause} />
      }
     
      return (
        <TableRow style={{"backgroundColor": "#e9f4f3"}} className={expanded ? "expand" : null} hoverable={true} key={index}>
          <TableRowColumn className="no-click-cell" style={expanded ? {height: this.state.divHeight} : null}>
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
               {id_attribute}
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell">
              <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
            <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell">
              <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
            <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell capitalized">
            <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>{device.status}
            </div>
          </TableRowColumn>

          <TableRowColumn style={{width:"55px", paddingRight:"0", paddingLeft:"12px"}} className="expandButton">
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index);
            }}>
              <IconButton className="float-right"><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
            </div>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", padding:"0", overflow:"visible"}}>
            <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this._expandRow(index);
            }}>
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}
             onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
              {expanded}
            </Collapse>
            </div>
          </TableRowColumn>
        </TableRow>
      )
    }, this);
    
    var deviceLimitWarning = (limitMaxed || limitNear) ?
      (
        <p className="warning">
          <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
          <span className={limitMaxed ? null : "hidden"}>You have reached</span><span className={limitNear&&!limitMaxed ? null : "hidden"}>You are nearing</span> your limit of authorized devices: {this.props.acceptedDevices} of {this.props.deviceLimit}
        </p>
    ) : null;

    var minHeight = deviceLimitWarning ? this.state.minHeight + 20 : this.state.minHeight;

    return (
      <Collapse springConfig={{stiffness: 190, damping: 20}} style={{minHeight:minHeight, width:"100%"}} isOpened={true} id="authorize" className="absolute authorize padding-top">
        
      <Loader show={this.state.authLoading==="all"} />

        { this.props.showHelptips && this.state.devices.length ?
          <div>
            <div 
              id="onboard-2"
              className={this.props.highlightHelp ? "tooltip help highlight" : "tooltip help"}
              data-tip
              data-for='review-devices-tip'
              data-event='click focus'
              style={{left:"60%",top:"35px"}}>
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip
              id="review-devices-tip"
              globalEventOff='click'
              place="bottom"
              type="light"
              effect="solid"
              className="react-tooltip">
              <AuthDevices devices={this.state.devices.length} />
            </ReactTooltip>
          </div>
        : null }

        { this.state.devices.length && this.state.authLoading!=="all" ?

          <div className="padding-bottom">

            <h3 className="align-center">{this.props.count} {pluralize("devices", this.props.count)} pending authorization</h3>

            {deviceLimitWarning}

            <Table
              selectable={false}>
              <TableHeader
                className="clickable"
                displaySelectAll={false}
                adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || "Device ID"}>{(this.props.globalSettings || {}).id_attribute || "Device ID"}<FontIcon onClick={this.props.openSettingsDialog} style={{fontSize: "16px"}} color={"#c7c7c7"} hoverColor={"#aeaeae"} className="material-icons hover float-right">settings</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="First request">First request</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Last updated">Last updated</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Status">Status</TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{width:"55px", paddingRight:"12px", paddingLeft:"0"}}></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                showRowHover={true}
                displayRowCheckbox={false}
                className="clickable">
                {devices}
              </TableBody>
            </Table>

            <div className="margin-top">
              <Pagination locale={_en_US} simple pageSize={20} current={this.state.currentPage || 1} total={this.props.count} onChange={this._handlePageChange} />
               {this.state.pageLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
            </div>
          </div>

          :

          <div className={this.state.authLoading ? "hidden" : "dashboard-placeholder"}>
            <p>There are no devices pending authorization</p>
            {this.props.highlightHelp ? <p>Visit the <Link to={`/help/connecting-devices`}>Help section</Link> to learn how to connect devices to the Mender server.</p> : null }
          </div>
        }


        { this.props.showHelptips && this.state.devices.length ?
          <div>
            <div 
              id="onboard-3"
              className="tooltip highlight help"
              data-tip
              data-for='expand-auth-tip'
              data-event='click focus'
              style={{left:"16%", top:"170px"}}>
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
      </Collapse>
    );
  }
});


module.exports = Pending;