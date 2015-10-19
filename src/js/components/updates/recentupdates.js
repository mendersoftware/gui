var React = require('react');
var Time = require('react-time');
var Report = require('./report.js');

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
      showReport:null 
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState.showReport !== this.state.showReport
  },
  _handleCellClick: function(rowNumber, columnId) {
    var report = this.props.recent[rowNumber];
    this.setState({showReport: report});
    this.refs['statusDialog'].show();
  },
  render: function() {
    var now = new Date().getTime();

    var progressCount = 0;
    var progress = this.props.progress.map(function(update, index) {
      if (update.start_time<now && update.end_time>now) {
        progressCount++;
        return (
          <TableRow hoverable={true} key={index}>
            <TableRowColumn>{update.group}</TableRowColumn>
            <TableRowColumn>{update.model}</TableRowColumn>
            <TableRowColumn>{update.software_version}</TableRowColumn>
            <TableRowColumn>{update.devices.length}</TableRowColumn>
            <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn>{update.status || "--"}</TableRowColumn>
          </TableRow>
        )
      }
    });

    var recentCount = 0;
    var recent = this.props.recent.map(function(update, index) {
      if (update.start_time<now && update.end_time<now) {
        recentCount++;
        return (
          <TableRow key={index}>
            <TableRowColumn>{update.group}</TableRowColumn>
            <TableRowColumn>{update.model}</TableRowColumn>
            <TableRowColumn>{update.software_version}</TableRowColumn>
            <TableRowColumn>{update.devices.length}</TableRowColumn>
            <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><FlatButton label={update.status || "--"} primary={update.status === 'Failed'} secondary={update.status === 'Complete'} /></TableRowColumn>
          </TableRow>
        )
      }
    });

    var dialogActions = [
      { text: 'Close' }
    ];
    return (
      <div>
        <div style={{marginTop:"30px"}}> 
          <h3>Updates in progress</h3>
          <Table
            className={progressCount ? null : 'hidden'}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
                <TableHeaderColumn tooltip="Model compatibility">Model compatibility</TableHeaderColumn>
                <TableHeaderColumn tooltip="Target software version">Software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
                <TableHeaderColumn tooltip="Start time">Start time</TableHeaderColumn>
                <TableHeaderColumn tooltip="End time">End time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {progress}
            </TableBody>
          </Table>
          <div className={progressCount ? 'hidden' : null}>
            <p className="italic">No updates in progress</p>
          </div>
        </div>

        <div style={{marginTop:"60px"}}>
          <h3>Recent updates</h3>
          <Table
            onCellClick={this._handleCellClick}
            className={recentCount ? null : 'hidden'}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
                <TableHeaderColumn tooltip="Model compatibility">Model compatibility</TableHeaderColumn>
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
              {recent}
            </TableBody>
          </Table>

          <div className={recentCount ? 'hidden' : null}>
            <p className="italic">No recent updates</p>
          </div>
        </div>

        <Dialog title="Update status report"
          actions={dialogActions}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          ref="statusDialog"
          contentClassName="largeDialog">
            <div style={{height: '1000px'}}>
              <Report update={this.state.showReport} />
            </div>
        </Dialog>

      </div>
    );
  }
});

module.exports = Recent;