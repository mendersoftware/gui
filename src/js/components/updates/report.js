import React from 'react';
var Time = require('react-time');
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;
var Checkbox = mui.Checkbox;

var Report = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: this.props.update.status === "Failed",
    };
  },
   componentDidMount: function() {
    AppActions.getSingleUpdateStats(this.props.update.id, function(stats) {
      this._updateState("stats",stats);
    }.bind(this));
    AppActions.getSingleUpdateDevices(this.props.update.id, function(devices) {
      this._updateState("devices",devices);
    }.bind(this));
  },
  _updateState: function (key, val) {
    var state = {};
    state[key] = val;
    this.setState(state);
  },
  _getDeviceDetails: function (id) {
    // get device details not listed in schedule data
    //return AppActions.getSingleDeviceReport(id)
  },
  _handleCheckbox: function(e, checked) {
    this.setState({failsOnly:checked});
  },
  _retryUpdate: function() {
    // replace contents of dialog, also change size, return contents and size on 'cancel'?
    this.props.retryUpdate(this.props.update);
  },
  render: function() {
    var deviceList = [];
    if (this.state.devices) {
      deviceList = this.state.devices.map(function(device, index) {
        //var deviceDetails = this._getDeviceDetails(device.id);
        if ((device.status==="Failed")||(this.state.failsOnly===false)){
          return (
            <TableRow key={index}>
              <TableRowColumn>{device.id}</TableRowColumn>
              <TableRowColumn>{this.props.update.version}</TableRowColumn>
              <TableRowColumn><Time value={device.finished} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
              <TableRowColumn>{device.status || "--"}</TableRowColumn>
              <TableRowColumn><FlatButton label="Export log" /></TableRowColumn>
            </TableRow>
          )
        }
      }, this);
    }
    var status = (this.props.update.status === "inprogress") ? "In progress" : this.props.update.status;
    return (
      <div>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Group" secondaryText={this.props.update.name} />
            <Divider />
            <ListItem disabled={true} primaryText="Device type" secondaryText={this.props.update.model || "--"} />
            <Divider />
            <ListItem disabled={true} primaryText="Start time" secondaryText={<Time value={this.props.update.created} format="YYYY/MM/DD HH:mm" />} />
          </List>
        </div>
        <div className="report-list">
         <List>
            <ListItem disabled={true} primaryText="Number of devices" secondaryText={deviceList.length} />
            <Divider />
            <ListItem disabled={true} primaryText="Target software" secondaryText={this.props.update.version} />
            <Divider />
            <ListItem disabled={true} primaryText="End time" secondaryText={<Time value={this.props.update.finished} format="YYYY/MM/DD HH:mm" />} />
          </List>
        </div>
        <div className="report-list">
         <List>
            <ListItem 
              disabled={this.props.update.status!=='Failed'}
              primaryText="Status"
              secondaryText={<p>{status}{this.props.update.status!=='Failed' ? '' : ' - Click to retry'}</p>}
              leftIcon={<FontIcon className={this.props.update.status==="inprogress" ? "hidden" : "material-icons error-icon"}>{this.props.update.status !=='Failed' ? 'check_circle' : 'error'}</FontIcon>} 
              onClick={this._retryUpdate} />
          </List>
        </div>
        <div className={this.props.update.status==='Complete' ? "hidden" : null} style={{display:"inline-block", width:"200px"}}>
          <Checkbox
            label="Show only failures"
            defaultChecked={this.props.update.status==='Failed'}
            checked={this.state.failsOnly}
            onCheck={this._handleCheckbox} />
        </div>

        <div style={{minHeight:"20vh"}}>

          <Table
            className={deviceList.length ? null : "hidden"}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device name">Device name</TableHeaderColumn>
                <TableHeaderColumn tooltip="Target software">Updated to</TableHeaderColumn>
                <TableHeaderColumn tooltip="Update end time">End time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Update status">Update status</TableHeaderColumn>
                <TableHeaderColumn tooltip=""></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {deviceList}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
});

module.exports = Report;