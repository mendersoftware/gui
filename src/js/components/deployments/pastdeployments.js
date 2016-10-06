import React from 'react';
import Time from 'react-time';
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');
var DeploymentStatus = require('./deploymentstatus');

var Loader = require('../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';


var Past = React.createClass({
  getInitialState: function() {
    return {
      retry: false
    };
  },
  _pastCellClick: function(rowNumber, columnId) {
    var report = this.props.past[rowNumber];
    this.props.showReport(report);
  },
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  render: function() {
    var pastMap = this.props.past.map(function(deployment, index) {
      //  get statistics
      var status = (
        <DeploymentStatus id={deployment.id} />
      );

      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right", width:"60px"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn style={{overflow:"visible"}}>{status}</TableRowColumn>
        </TableRow>
      )
    }, this);

    var reportActions = [
      { text: 'Close' }
    ];
    var retryActions = [
      { text: 'Cancel' },
      { text: 'Create deployment', onClick: this._onUploadSubmit, primary: 'true' }
    ];
    return (
      <div>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          <Table
            onCellClick={this._pastCellClick}
            className={pastMap.length ? null : 'hidden'}
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
                <TableHeaderColumn>Started</TableHeaderColumn>
                <TableHeaderColumn>Finished</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", width:"60px"}}># Devices</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              style={{cursor:"pointer", overflow:"visible"}}>
              {pastMap}
            </TableBody>
          </Table>

          <div className={(pastMap.length || this.props.loading) ? 'hidden' : "dashboard-placeholder"}>
            <p>Completed deployments will appear here.</p>
            <p>You can review logs and reports for each device group you've deployed to</p>
            <img src="assets/img/history.png" alt="Past" />
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Past;