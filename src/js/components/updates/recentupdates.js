var React = require('react');
var Time = require('react-time');
var AppStore = require('../../stores/app-store');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;


var Recent = React.createClass({
  _getDevices: function(group, model) {
    return AppStore.getDevicesFromParams(group, model);
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.groups !== this.props.groups;
  },
  render: function() {
    var getDevices = this._getDevices;
    var items = this.props.updates.map(function(update, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.group}</TableRowColumn>
          <TableRowColumn>{update.model}</TableRowColumn>
          <TableRowColumn>{update.software_version}</TableRowColumn>
          <TableRowColumn>{getDevices(update.group, update.model)}</TableRowColumn>
          <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{update.status || "--"}</TableRowColumn>
        </TableRow>
      )
    });
    return (
      <div>
        <Table
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
              <TableHeaderColumn tooltip="Model compatibility">Model compatibility</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target software version">Software</TableHeaderColumn>
              <TableHeaderColumn tooltip="Number of devices">Number of devices</TableHeaderColumn>
              <TableHeaderColumn tooltip="Start time">Start time</TableHeaderColumn>
              <TableHeaderColumn tooltip="End time">End time</TableHeaderColumn>
              <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            {items}
          </TableBody>
        </Table>
      </div>
    );
  }
});

module.exports = Recent;