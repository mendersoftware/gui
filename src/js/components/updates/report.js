var React = require('react');
var Time = require('react-time');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;


var Report = React.createClass({
  
  render: function() {
    var deviceList = this.props.update.devices.map(function(device, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{device.name}</TableRowColumn>
          <TableRowColumn>{device.model}</TableRowColumn>
          <TableRowColumn>{device.last_software_version}</TableRowColumn>
          <TableRowColumn>{device.software_version}</TableRowColumn>
          <TableRowColumn><Time value={device.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={device.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{device.status || "--"}</TableRowColumn>
          <TableRowColumn><FlatButton label="Export log" /></TableRowColumn>
        </TableRow>
      )
    });
    return (
      <div>
        <div>
          <ul>
            <li><label>Number of devices</label>: <span>{this.props.update.devices.length}</span></li>
            <li><label>Group</label>: <span>{this.props.update.group}</span></li>
            <li><label>Device type</label>: <span>{this.props.update.model}</span></li>
            <li><label>Software</label>: <span>{this.props.update.software_version}</span></li>
          </ul>
        </div>
        <div>
          <ul>
            <li><label>Status</label>: <span>{this.props.update.status}</span></li>
            <li><label>Start time</label>: <span><Time value={this.props.update.start_time} format="YYYY/MM/DD HH:mm" /></span></li>
            <li><label>End time</label>: <span><Time value={this.props.update.end_time} format="YYYY/MM/DD HH:mm" /></span></li>
          </ul>
        </div>

        <Table
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device name">Device name</TableHeaderColumn>
              <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
              <TableHeaderColumn tooltip="Previous software">Updating from</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target software">Updated to </TableHeaderColumn>
              <TableHeaderColumn tooltip="Update start time">Start time</TableHeaderColumn>
              <TableHeaderColumn tooltip="Update end time">End time</TableHeaderColumn>
              <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
              <TableHeaderColumn tooltip=""></TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            {deviceList}
          </TableBody>
        </Table>
      </div>
    );
  }
});

module.exports = Report;