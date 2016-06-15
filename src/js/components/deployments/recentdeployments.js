import React from 'react';
var Time = require('react-time');
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');

var ProgressChart = require('./progresschart');
var DeploymentStatus = require('./deploymentstatus');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;

var progress = [];
var recent = [];

var Recent = React.createClass({
  getInitialState: function() {
    return {
      showReport: null,
      retry: false
    };
  },
  componentWillReceiveProps: function(nextProps) {
    progress = nextProps.progress;
    recent = nextProps.recent;
  },
  _recentCellClick: function(rowNumber, columnId) {
    var report = recent[rowNumber];
    this.props.showReport(report);
  },
  _progressCellClick: function(rowNumber, columnId) {
    var report = progress[rowNumber];
    this.props.showReport(report);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    // get statistics for each in progress
    var progressMap = progress.map(function(deployment, index) {

      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn>--</TableRowColumn>
          <TableRowColumn>In progress</TableRowColumn>
        </TableRow>
      )
    }, this);
 
    var recentMap = recent.map(function(deployment, index) {
      //  get statistics
      var status = (
        <DeploymentStatus id={deployment.id} />
      );

      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{status}</TableRowColumn>
        </TableRow>
      )
    }, this);

    var reportActions = [
      { text: 'Close' }
    ];
    var retryActions = [
      { text: 'Cancel' },
      { text: 'Deploy update', onClick: this._onUploadSubmit, primary: 'true' }
    ];
    return (
      <div>
        <div style={{marginBottom:"60"}}> 
          <h3>In progress</h3>
          <Table
            onCellClick={this._progressCellClick}
            className={progressMap.length ? null : 'hidden'}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
                <TableHeaderColumn tooltip="Target software version">Target software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
                <TableHeaderColumn tooltip="Start time">Start time</TableHeaderColumn>
                <TableHeaderColumn tooltip="End time">End time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              className="clickable">
              {progressMap}
            </TableBody>
          </Table>
          <div className={progressMap.length ? 'hidden' : "dashboard-placeholder"}>
            <p>Ongoing deployments will appear here. Deploy an update to get started</p>
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        </div>

        <div style={{marginTop:"60"}}>
          <h3>Recent</h3>
          <Table
            onCellClick={this._recentCellClick}
            className={recentMap.length ? null : 'hidden'}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
                <TableHeaderColumn tooltip="Target software version">Target software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
                <TableHeaderColumn tooltip="Start time">Start time</TableHeaderColumn>
                <TableHeaderColumn tooltip="End time">End time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              style={{cursor:"pointer"}}>
              {recentMap}
            </TableBody>
          </Table>

          <div className={recentMap.length ? 'hidden' : "dashboard-placeholder"}>
            <p>Completed deployments will appear here.</p>
            <p>You can review logs and reports for each device group you've deployed to</p>
            <img src="assets/img/history.png" alt="Recent" />
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Recent;