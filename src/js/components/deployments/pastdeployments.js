import React from 'react';
var Time = require('react-time');
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');
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

var past = [];

var Past = React.createClass({
  getInitialState: function() {
    return {
      showReport: null,
      retry: false
    };
  },
  componentWillReceiveProps: function(nextProps) {
    past = nextProps.past;
  },
  _pastCellClick: function(rowNumber, columnId) {
    var report = past[rowNumber];
    this.props.showReport(report);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    var pastMap = past.map(function(deployment, index) {
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
      { text: 'Create deployment', onClick: this._onUploadSubmit, primary: 'true' }
    ];
    return (
      <div>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          <Table
            onCellClick={this._pastCellClick}
            className={pastMap.length ? null : 'hidden'}
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