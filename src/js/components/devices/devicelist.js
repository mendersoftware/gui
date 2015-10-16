var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;

var DeviceList = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.devices !== this.props.devices;
  },
  _onRowSelection: function(rows) {
    if (rows === "all") {
      rows = [];
      for (var i=0; i<this.props.devices.length;i++) {
        rows.push(i);
      }
    }
    AppActions.selectDevices(rows);
  },
  _selectAll: function(rows) {
    console.log("select all", rows);
  },
  render: function() {
    var devices = this.props.devices.map(function(device) {
      return (
        <TableRow key={device.id}>
          <TableRowColumn>{device.name}</TableRowColumn>
          <TableRowColumn>{device.model}</TableRowColumn>
          <TableRowColumn>{device.software_version}</TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
        </TableRow>
      )
    })
    return (
      <Table
        onRowSelection={this._onRowSelection}
        multiSelectable={true}>
        <TableHeader
        enableSelectAll={true}
        onSelectAll={this._selectAll}>
          <TableRow>
            <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
            <TableHeaderColumn tooltip="Model">Model</TableHeaderColumn>
            <TableHeaderColumn tooltip="Installed software">Software</TableHeaderColumn>
            <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          deselectOnClickaway={false}>
          {devices}
        </TableBody>
      </Table>
    );
  }
});

module.exports = DeviceList;