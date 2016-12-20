import React from 'react';
import Time from 'react-time';

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;


var Schedule = React.createClass({
  _handleEdit: function (deployment) {
    this.props.edit(deployment);
  },
  _handleRemove: function (id) {
    this.props.remove(id);
  },
  render: function() {
    var now = new Date().getTime();

    var scheduleCount = 0;
    var schedule = this.props.schedule.map(function(deployment, index) {
      if (deployment.start_time>now) {
        scheduleCount++;
        return (
          <TableRow key={index}>
            <TableRowColumn>{deployment.group}</TableRowColumn>
            <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
            <TableRowColumn>{deployment.devices.length}</TableRowColumn>
            <TableRowColumn><Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><Time value={deployment.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn>Begins <Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" relative /></TableRowColumn>
            <TableRowColumn><div><FlatButton secondary={true} style={{padding:"0", marginRight:"4", minWidth:"55"}} label="Edit" onClick={this._handleEdit.bind(null, deployment)} /><FlatButton style={{padding:"0", marginLeft:"4", minWidth:"55"}} label="Remove" onClick={this._handleRemove.bind(null, deployment.id)} /></div></TableRowColumn>
          </TableRow>
        )
      }
    }, this);
    return (
      <div>
        <h3>Scheduled deployments</h3>
        <Table
          className={scheduleCount ? null : 'hidden'}
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target artifact version">Target artifact</TableHeaderColumn>
              <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
              <TableHeaderColumn tooltip="Started">Started</TableHeaderColumn>
              <TableHeaderColumn tooltip="Finished">Finished</TableHeaderColumn>
              <TableHeaderColumn tooltip="Details">Details</TableHeaderColumn>
              <TableHeaderColumn tooltip="Actions"></TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            showRowHover={true}
            displayRowCheckbox={false}>
            {schedule}
          </TableBody>
        </Table>
        <div className={scheduleCount ? 'hidden' : null}>
          <p className="italic">No deployments scheduled</p>
        </div>
      </div>
    );
  }
});

module.exports = Schedule;