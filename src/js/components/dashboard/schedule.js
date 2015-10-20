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


var Schedule = React.createClass({
  render: function() {
    var schedule = this.props.schedule.map(function(update, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.group}</TableRowColumn>
          <TableRowColumn>{update.software_version}</TableRowColumn>
          <TableRowColumn>{update.devices.length}</TableRowColumn>
          <TableRowColumn>Begins <Time value={update.start_time} format="YYYY/MM/DD HH:mm" relative /></TableRowColumn>
        </TableRow>
      )
    });
    return (
      <div className="widget">
        <h3>Scheduled updates</h3>
        <Table
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target software">Software</TableHeaderColumn>
              <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
              <TableHeaderColumn tooltip="Details">Details</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            {schedule}
          </TableBody>
        </Table>
        <div className={schedule.length ? 'hidden' : null}>
          <p className="italic">No updates scheduled</p>
        </div>
      </div>
    );
  }
});

module.exports = Schedule;