import React from 'react';
var Time = require('react-time');
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');

var ProgressBar = require('./progressbar');

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
  _handleCellClick: function(rowNumber, columnId) {
    var report = recent[rowNumber];
    this.props.showReport(report);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    // get statistics for each in progress
    var progressMap = progress.map(function(update, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.name}</TableRowColumn>
          <TableRowColumn>{update.version}</TableRowColumn>
          <TableRowColumn>-</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(update.created)} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(update.finished)} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><ProgressBar noPadding={true} update={update} /></TableRowColumn>
        </TableRow>
      )
    }, this);
 
    var recentMap = recent.map(function(update, index) {
      // if failure, get statistics
      var status = (update.status === "inprogress") ? "In progress" : update.status;
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.name}</TableRowColumn>
          <TableRowColumn>{update.version}</TableRowColumn>
          <TableRowColumn>-</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(update.created)} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(update.finished)} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><FlatButton label={status} primary={update.status === 'failed'} secondary={update.status === 'complete'} /></TableRowColumn>
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
          <h3>Updates in progress</h3>
          <Table
            className={progressMap.length ? null : 'hidden'}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
                <TableHeaderColumn tooltip="Target software version">Software</TableHeaderColumn>
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
          <div className={progressMap.length ? 'hidden' : null}>
            <p className="italic">No updates in progress</p>
          </div>
        </div>

        <div style={{marginTop:"60"}}>
          <h3>Recent updates</h3>
          <Table
            onCellClick={this._handleCellClick}
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

          <div className={recentMap.length ? 'hidden' : null}>
            <p className="italic">No recent updates</p>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Recent;