import React from 'react';
import Time from 'react-time';
var update = require('react-addons-update');
var ProgressReport = require('./progressreport.js');
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');

var ProgressChart = require('./progresschart');
var DeploymentStatus = require('./deploymentstatus');

var Loader = require('../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

var Progress = React.createClass({
  getInitialState: function() {
    return {
      showReport: false,
      retry: false,
      report: null
    };
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.progress[this.state.rowNumber] !== this.props.progress[this.state.rowNumber]) {
      var report = update(this.state.report, {
        status : {$set: "finished"}
      });
      this.setState({report: report});
    }
  },
  _progressCellClick: function(rowNumber, columnId) {
    var self = this;
    this.setState({report: self.props.progress[rowNumber], showReport: true, rowNumber: rowNumber});
  },
  _formatTime: function(date) {
    if (date) {
       return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  dialogDismiss: function() {
    this.setState({
      report: null,
      showReport: false
    });
    clearInterval(this.timer);
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

    var reportActions = [
      <FlatButton
          label="Close"
          onClick={this.dialogDismiss} />
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


         <Dialog
          ref="dialog"
          title="Deployment progress"
          actions={reportActions}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          contentClassName="largeDialog"
          bodyStyle={{paddingTop:"0"}}
          open={this.state.showReport}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          <ProgressReport deployment={this.state.report} />
        </Dialog>

      </div>
    );
  }
});

module.exports = Progress;