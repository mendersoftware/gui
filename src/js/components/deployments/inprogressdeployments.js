import React from 'react';
import Time from 'react-time';
var update = require('react-addons-update');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');
var DeploymentStatus = require('./deploymentstatus');

var Loader = require('../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';

var Progress = React.createClass({
  getInitialState: function() {
    return {
      retry: false,
    };
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  _progressCellClick: function(rowNumber, columnId) {
    var self = this;
    this.props.openReport(rowNumber);
  },
  _formatTime: function(date) {
    if (date) {
       return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  render: function() {
    // get statistics for each in progress
    var progressMap = this.props.progress.map(function(deployment, index) {
      var status = (
        <DeploymentStatus refresh={true} id={deployment.id} />
      );
      return (
        <TableRow style={{height:"52px"}} key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right", width:"60px"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn style={{overflow:"visible"}}>{status}</TableRowColumn>
        </TableRow>
      )
    }, this);

    return (
      <div>
        <div className="deploy-table-contain"> 
          <Loader show={this.props.loading} />
          <Table
            onCellClick={this._progressCellClick}
            className={progressMap.length ? null : 'hidden'}
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
                <TableHeaderColumn style={{textAlign:"right", width:"60px"}}># Devices</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              className="clickable">
              {progressMap}
            </TableBody>
          </Table>
          <div className={(progressMap.length || this.props.loading)  ? 'hidden' : "dashboard-placeholder"}>
            <p>Ongoing deployments will appear here. <a onClick={this.props.createClick}>Create a deployment</a> to get started</p>
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        </div>



      </div>
    );
  }
});

module.exports = Progress;