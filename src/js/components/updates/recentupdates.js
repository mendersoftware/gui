var React = require('react');
var Time = require('react-time');
var Report = require('./report.js');
var ScheduleForm = require('./scheduleform');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var Dialog = mui.Dialog;
var FlatButton = mui.FlatButton;


var Recent = React.createClass({
  getInitialState: function() {
    return {
      showReport: null,
      retry: false
    };
  },

  _handleCellClick: function(rowNumber, columnId) {
    var report = this.props.recent[rowNumber];
    this.props.showReport(report);
  },
  render: function() {
    var now = new Date().getTime();
    var progress = this.props.progress.map(function(update, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.group}</TableRowColumn>
          <TableRowColumn>{update.software_version}</TableRowColumn>
          <TableRowColumn>{update.devices.length}</TableRowColumn>
          <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{update.status || "--"}</TableRowColumn>
        </TableRow>
      )
    });

    var recent = this.props.recent.map(function(update, index) {
      var failCount=0;
      for (var i=0;i<update.devices.length;i++) {
        if (update.devices[i].status==='Failed') {failCount++}
      }
      failCount = update.status === "Failed" ? " ("+failCount+")" : '';
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.group}</TableRowColumn>
          <TableRowColumn>{update.software_version}</TableRowColumn>
          <TableRowColumn>{update.devices.length}</TableRowColumn>
          <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn><FlatButton label={(update.status || "--") + failCount} primary={update.status === 'Failed'} secondary={update.status === 'Complete'} /></TableRowColumn>
        </TableRow>
      )
    });

    var reportActions = [
      { text: 'Close' }
    ];
    var retryActions = [
      { text: 'Cancel' },
      { text: 'Schedule update', onClick: this._onUploadSubmit, primary: 'true' }
    ];
    return (
      <div>
        <div style={{marginBottom:"60"}}> 
          <h3>Updates in progress</h3>
          <Table
            className={progress.length ? null : 'hidden'}
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
              style={{cursor:"pointer"}}>
              {progress}
            </TableBody>
          </Table>
          <div className={progress.length ? 'hidden' : null}>
            <p className="italic">No updates in progress</p>
          </div>
        </div>

        <hr className="table-divider" />

        <div style={{marginTop:"60"}}>
          <h3>Recent updates</h3>
          <Table
            onCellClick={this._handleCellClick}
            className={recent.length ? null : 'hidden'}
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
              {recent}
            </TableBody>
          </Table>

          <div className={recent.length ? 'hidden' : null}>
            <p className="italic">No recent updates</p>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = Recent;