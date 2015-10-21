var React = require('react');
var Time = require('react-time');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;


var Schedule = React.createClass({
  render: function() {
    var now = new Date().getTime();

    var scheduleCount = 0;
    var schedule = this.props.schedule.map(function(update, index) {
      if (update.start_time>now) {
        scheduleCount++;
        return (
          <TableRow key={index}>
            <TableRowColumn>{update.group}</TableRowColumn>
            <TableRowColumn>{update.software_version}</TableRowColumn>
            <TableRowColumn>{update.devices.length}</TableRowColumn>
            <TableRowColumn><Time value={update.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><Time value={update.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><span>Begins </span><Time value={update.start_time} format="YYYY/MM/DD HH:mm" relative /></TableRowColumn>
            <TableRowColumn><FlatButton label="Edit" /><FlatButton label="Remove" /></TableRowColumn>
          </TableRow>
        )
      }
    });
    return (
      <div>
        <div style={{marginTop:"30px"}}> 
          <h3>Scheduled updates</h3>
          <Table
            className={scheduleCount ? null : 'hidden'}
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
                <TableHeaderColumn tooltip="Details">Details</TableHeaderColumn>
                <TableHeaderColumn tooltip="Actions"></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              style={{cursor:"pointer"}}>
              {schedule}
            </TableBody>
          </Table>
          <div className={scheduleCount ? 'hidden' : null}>
            <p className="italic">No updates scheduled</p>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Schedule;