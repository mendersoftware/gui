var React = require('react');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;


var Progress = React.createClass({
  render: function() {
    var progress = this.props.progress.map(function(update, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{update.group}</TableRowColumn>
          <TableRowColumn>{update.software_version}</TableRowColumn>
          <TableRowColumn>{update.devices.length}</TableRowColumn>
          <TableRowColumn>{update.status || "--"}</TableRowColumn>
        </TableRow>
      )
    });
    return (
      <div className="widget">
        <h3>Updates in progress</h3>
        <Table
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target software">Software</TableHeaderColumn>
              <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
              <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            {progress}
          </TableBody>
        </Table>
        <div className={progress.length ? 'hidden' : null}>
          <p className="italic">No updates in progress</p>
        </div>
      </div>
    );
  }
});

module.exports = Progress;