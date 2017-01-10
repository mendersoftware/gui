import React from 'react';
import Time from 'react-time';
var GroupDevices = require('./groupdevices');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';

var Pending = React.createClass({
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  _abortHandler: function(id) {
    this.props.abort(id);
  },
  render: function() {
    var pendingMap = this.props.pending.map(function(deployment, index) {
      //  get statistics
     
      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right", width:"100px"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn>{deployment.status}</TableRowColumn>
          <TableRowColumn style={{width:"126px"}}><FlatButton label="Abort" secondary={true} onClick={this._abortHandler.bind(null, deployment.id)} /></TableRowColumn>
        </TableRow>
      )
    }, this);

    return (
      <div className={pendingMap.length ? "fadeIn" : "hidden" }>
        <h3>Pending</h3>
        <div className="deploy-table-contain">
          <Table
            selectable={false}
            style={{overflow:"visible"}}
            wrapperStyle={{overflow:"visible"}}
            bodyStyle={{overflow:"visible"}}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow
              style={{overflow:"visible"}}>
                <TableHeaderColumn>Updating to</TableHeaderColumn>
                <TableHeaderColumn>Group</TableHeaderColumn>
                <TableHeaderColumn>Created</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", width:"100px"}}># Devices</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn style={{width:"126px"}}></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              style={{cursor:"pointer", overflow:"visible"}}>
              {pendingMap}
            </TableBody>
          </Table>
        </div>

      </div>
    );
  }
});

module.exports = Pending;