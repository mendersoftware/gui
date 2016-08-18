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
    if (date) {
       return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  render: function() {
    // get statistics for each in progress
    var progressMap = progress.map(function(deployment, index) {
      var status = (
        <DeploymentStatus id={deployment.id} />
      );
      return (
        <TableRow style={{height:"52"}} key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right", width:"60"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
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
                <TableHeaderColumn>Start time</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", width:"60"}}># Devices</TableHeaderColumn>
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