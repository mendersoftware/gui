import React from 'react';
var Time = require('react-time');
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');

var ProgressChart = require('./progresschart');
var DeploymentStatus = require('./deploymentstatus');

var Loader = require('../common/loader');

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

var Progress = React.createClass({
  getInitialState: function() {
    return {
      showReport: null,
      retry: false
    };
  },
  componentWillReceiveProps: function(nextProps) {
    progress = nextProps.progress;
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
          <div className={(progressMap.length || this.props.loading)  ? 'hidden' : "dashboard-placeholder"}>
            <p>Ongoing deployments will appear here. Create a deployment to get started</p>
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Progress;