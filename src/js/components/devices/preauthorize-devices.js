import React from 'react';
import ReactDOM from 'react-dom';
import Time from 'react-time';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';
import { Router, Link } from 'react-router';
var Loader = require('../common/loader');
var AppActions = require('../../actions/app-actions');
var ExpandedDevice = require('./expanded-device');
var createReactClass = require('create-react-class');
var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var Dropzone = require('react-dropzone');
var pluralize = require('pluralize');
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { isEmpty, preformatWithRequestID } from '../../helpers.js';


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
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FileIcon from 'react-material-icons/icons/file/file-upload';

var Preauthorize =  createReactClass({
  getInitialState: function() {
    return {
      minHeight: 260,
      divHeight: 208,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      authLoading: "all",
      openPreauth: false,
      openRemove: false,
      inputs: [{key:"", value:""}],
      public: "",
      showKey: false,
      devicesToRemove: [],
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
      || ((prevProps.currentTab !== this.props.currentTab) && (this.props.currentTab.indexOf("Preauthorized")!== -1)) ) {
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
        self.setState({devices: devices, pageLoading: false, authLoading: null, expandRow: null});
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
        self._adjustHeight();
      },
      error: function(error) {
        var errormsg = error.res.body.error || "Please check your connection";
        self.setState({pageLoading: false, authLoading: null });
        AppActions.setSnackbar(preformatWithRequestID(error.res, "Preauthorized devices couldn't be loaded. " + errormsg), null, "Copy to clipboard");
      }
    };
    AppActions.getDevicesByStatus(callback, "preauthorized", this.state.pageNo, this.state.pageLength);
  },

  _adjustHeight: function () {
    // do this when number of devices changes
    var h = this.state.devices.length * 55;
    h += 230;
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
    self.setState({pageLoading:true, expandRow: null, pageNo: pageNo}, () => {self._getDevices()});
  },

  _dialogToggle: function(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
    this._clearForm();
  },

  _clearForm: function() {
    this.setState({public: "", filename:"", inputs: [{key:"", value:""}]});
  },

  _updateKey: function(index, event) {
    var inputs = this.state.inputs;
    inputs[index].key = event.target.value;
    this.setState({inputs: inputs, errorText: "", errorText1: ""});
    this._convertIdentityToJSON(inputs);
  },

  _updateValue: function(index, event) {
    var inputs = this.state.inputs;
    inputs[index].value = event.target.value;
    this.setState({inputs: inputs, errorText: "", errorText1: ""});
    this._convertIdentityToJSON(inputs);
  },

  _addKeyValue: function() {
    var inputs = this.state.inputs;
    inputs.push({key:"", value:""}); 
    this.setState({inputs: inputs, errorText: "", errorText1: ""});
  },

  _removeInput: function(index) {
    var inputs = this.state.inputs;
    inputs.splice(index, 1);
    this.setState({inputs: inputs, errorText: "", errorText1: ""});
    this._convertIdentityToJSON(inputs);
  },

  _convertIdentityToJSON: function(arr) {
    var obj = {};
    for (var i=0; i<arr.length; i++) {
      if (arr[i].value) {
        obj[arr[i].key] = arr[i].value;
      }
    }
    console.log(obj);
    this.setState({json_identity: obj});
  },

  _savePreauth: function(close) {
    var self = this;
    var authset = {
      pubkey: this.state.public,
      identity_data: this.state.json_identity,
    };
    var callback = {
      success: function(res) {
        AppActions.setSnackbar("Device was successfully added to the preauthorization list", 5000);
        self._getDevices();
        self.props.refreshCount();

        if (close) {
          self._dialogToggle("openPreauth");
        } else {
          self._clearForm();
        }
      },
      error: function(err) {
        console.log(err);
        var errMsg = (err.res.body||{}).error || "";
        
        if (err.res.status === 409) {
          self.setState({errorText: "A device with a matching identity data set already exists", errorText1: " "});
        } else {
          AppActions.setSnackbar(preformatWithRequestID(err.res, "The device could not be added: "+errMsg), null, "Copy to clipboard");
        }
      }
    }
    AppActions.preauthDevice(authset, callback);
  },

  onDrop: function (acceptedFiles, rejectedFiles) {
    var self = this;
    if (acceptedFiles.length) {
      var reader = new FileReader();
      reader.readAsBinaryString(acceptedFiles[0]);
      reader.fileName = acceptedFiles[0].name;
      reader.onload = function () {
        var str = reader.result.replace(/\n|\r/g, "\n");
        self.setState({public: str, filename: reader.fileName});
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    if (rejectedFiles.length) {
      AppActions.setSnackbar("File '"+rejectedFiles[0].name +"'' was rejected.");
    }
  },

  _removeKey: function () {
    this.setState({public: null, filename: null});
  },

  render: function() {
    var limitMaxed = this.props.deviceLimit && (this.props.deviceLimit <= this.props.acceptedDevices);

    var devices = this.state.devices.map(function(device, index) {
      var self = this;

    var id_attribute  = (self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== "Device ID") 
        ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
        : (device.device_id || device.id) ;

      var expanded = '';
      if ( self.state.expandRow === index ) {
        expanded = <ExpandedDevice 
                    id_attribute={(this.props.globalSettings || {}).id_attribute} 
                    _showKey={this._showKey} 
                    showKey={this.state.showKey} 
                    limitMaxed={limitMaxed} 
                    styles={this.props.styles} 
                    deviceId={self.state.deviceId}
                    id_attribute={(this.props.globalSettings || {}).id_attribute} 
                    id_value={id_attribute}
                    device={self.state.expandedDevice} 
                    unauthorized={true} 
                    pause={self.props.pause}  />
      }



      return (
        <TableRow className={expanded ? "expand" : null} hoverable={true} key={index}>
          <TableRowColumn className="no-click-cell" style={expanded ? {height: this.state.divHeight} : null}>
             <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              self._expandRow(index);
            }}>
              { id_attribute }
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
    
     var deviceLimitWarning = limitMaxed ?
      (
        <p className="warning">
          <InfoIcon style={{marginRight:"2px", height:"16px", verticalAlign:"bottom"}} />
          You have reached your limit of authorized devices: {this.props.acceptedDevices} of {this.props.deviceLimit}
        </p>
    ) : null;

    var minHeight = deviceLimitWarning ? this.state.minHeight + 20 : this.state.minHeight;

    var preauthActions =  [
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this._dialogToggle.bind(null, "openPreauth")} />
      </div>,
      <div style={{marginRight:"10px", display:"inline-block"}}>
        <RaisedButton
          disabled={!this.state.public || isEmpty(this.state.json_identity) || !!limitMaxed}
          label="Save and add another"
          onClick={this._savePreauth.bind(null, false)}
          primary={true} />
      </div>,
      <RaisedButton
        disabled={!this.state.public || isEmpty(this.state.json_identity) || !!limitMaxed}
        label="Save"
        onClick={this._savePreauth.bind(null, true)}
        secondary={true} />
    ];

  
    var inputs = this.state.inputs.map(function(input, index) {
      var self = this;
      return (
        <div key={index}>
          <TextField hintText="Key" id={"key-"+index} value={input.key} style={{marginRight:"15px", marginBottom: "15px", verticalAlign:"top"}} onChange={this._updateKey.bind(null, index)} errorStyle={{color: "rgb(171, 16, 0)"}}
            errorText={index===this.state.inputs.length-1 ? this.state.errorText : ""} />
          <TextField hintText="Value" id={"value-"+index} style={{verticalAlign:"top"}} value={input.value} onChange={this._updateValue.bind(null, index)} errorStyle={{color: "rgb(171, 16, 0)"}}
            errorText={index===this.state.inputs.length-1 ? this.state.errorText1 : ""} />
          {this.state.inputs.length>1 ? <IconButton iconStyle={{width:"16px"}} disabled={!this.state.inputs[index].key || !this.state.inputs[index].value } onClick={this._removeInput.bind(null, index)}><FontIcon className="material-icons">clear</FontIcon></IconButton> : null }
        </div>
      )
    }, this);

    return (
      <Collapse springConfig={{stiffness: 190, damping: 20}} style={{minHeight:minHeight, width:"100%"}} isOpened={true} id="preauthorize" className="absolute authorize padding-top">
        
      <RaisedButton disabled={!!limitMaxed} className="top-right-button" secondary={true} label="Preauthorize devices" onClick={this._dialogToggle.bind(null, 'openPreauth')} />
      
      <Loader show={this.state.authLoading==="all"} />

        { this.state.devices.length && this.state.authLoading!=="all" ?

          <div className="padding-bottom">

            <h3 className="align-center">Preauthorized devices</h3>
            {deviceLimitWarning}
            
            <Table
              selectable={false}>
              <TableHeader
                className="clickable"
                displaySelectAll={false}
                adjustForCheckbox={false}>>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || "Device ID"}>{(this.props.globalSettings || {}).id_attribute || "Device ID"}<FontIcon onClick={this.props.openSettingsDialog} style={{fontSize: "16px"}} color={"#c7c7c7"} hoverColor={"#aeaeae"} className="material-icons hover float-right">settings</FontIcon></TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Date added">Date added</TableHeaderColumn>
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
              <Pagination locale={_en_US} simple pageSize={this.state.pageLength} current={this.state.pageNo || 1} total={this.props.count} onChange={this._handlePageChange} />
               {this.state.pageLoading ?  <div className="smallLoaderContainer"><Loader show={true} /></div> : null}
            </div>
          </div>

          :

          <div className={this.state.authLoading ? "hidden" : "dashboard-placeholder"}>
            <p>There are no preauthorized devices.</p>
            <p>{limitMaxed ? "Preauthorize devices" : <a onClick={this._dialogToggle.bind(null, "openPreauth")}>Preauthorize devices</a>} so that when they come online, they will connect to the server immediately</p>
            <img src="assets/img/preauthorize.png" alt="preauthorize" />
          </div>
        }


        <Dialog
          open={this.state.openPreauth}
          actions={preauthActions}
          title='Preauthorize devices'
          autoDetectWindowHeight={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px", minHeight:"375px"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}>
         
          <p>You can preauthorize a device by adding its authentication dataset here.</p>
          <p>This means when a device with the matching key and identity data comes online, it will automatically be authorized to connect to the server.</p>


          
         <h4 className="margin-top margin-bottom-small">Public key</h4>
          {this.state.filename ? 
            <div>
              <TextField id="keyfile" value={this.state.filename} disabled={true} underlineStyle={{borderBottom:"1px solid rgb(224, 224, 224)"}} inputStyle={{color:"rgba(0, 0, 0, 0.8)"}} /><IconButton style={{top:"6px"}} onClick={this._removeKey}><FontIcon className="material-icons">clear</FontIcon></IconButton>
            </div>
            : 
          <div>
            <Dropzone className="dropzone onboard" activeClassName="active" rejectClassName="active" multiple={false} onDrop={this.onDrop} style={{width: "528px"}}>
              <div className="icon inline-block"><FileIcon style={{height:"24px", width:"24px", verticalAlign:"middle", marginTop:"-2px"}}/></div>
              <div className="dashboard-placeholder inline">Drag here or <a>browse</a> to upload a public key file</div>
            </Dropzone>
          </div> }

          <h4 className="margin-bottom-none margin-top">Identity data</h4>
          {inputs}

          <FloatingActionButton disabled={!this.state.inputs[this.state.inputs.length-1].key || !this.state.inputs[this.state.inputs.length-1].value } style={{marginTop:"10px"}} mini={true} onClick={this._addKeyValue}>
            <ContentAdd />
          </FloatingActionButton>

           {deviceLimitWarning}
        </Dialog>


      </Collapse>
    );
  }
});


module.exports = Preauthorize;