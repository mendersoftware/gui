import React from 'react';
import Time from 'react-time';

// material ui
import FlatButton from 'material-ui/FlatButton';
import Table from 'material-ui/Table/Table';
import TableHeader from 'material-ui/Table/TableHeader';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';

export default class Schedule extends React.Component {
  _handleEdit(deployment) {
    this.props.edit(deployment);
  }
  _handleRemove(id) {
    this.props.remove(id);
  }
  render() {
    var now = new Date().getTime();

    var scheduleCount = 0;
    var schedule = this.props.schedule.map(function(deployment, index) {
      if (deployment.start_time > now) {
        scheduleCount++;
        return (
          <TableRow key={index}>
            <TableRowColumn>{deployment.group}</TableRowColumn>
            <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
            <TableRowColumn>{deployment.devices.length}</TableRowColumn>
            <TableRowColumn>
              <Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" />
            </TableRowColumn>
            <TableRowColumn>
              <Time value={deployment.end_time} format="YYYY/MM/DD HH:mm" />
            </TableRowColumn>
            <TableRowColumn>
              Begins <Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" relative />
            </TableRowColumn>
            <TableRowColumn>
              <div>
                <FlatButton
                  secondary={true}
                  style={{ padding: '0', marginRight: '4', minWidth: '55' }}
                  label="Edit"
                  onClick={() => this._handleEdit(deployment)}
                />
                <FlatButton style={{ padding: '0', marginLeft: '4', minWidth: '55' }} label="Remove" onClick={() => this._handleRemove(deployment.id)} />
              </div>
            </TableRowColumn>
          </TableRow>
        );
      }
    }, this);
    return (
      <div>
        <h3>Scheduled deployments</h3>
        <Table className={scheduleCount ? null : 'hidden'} selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device group">Group</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target artifact version">Target artifact</TableHeaderColumn>
              <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
              <TableHeaderColumn tooltip="Started">Started</TableHeaderColumn>
              <TableHeaderColumn tooltip="Finished">Finished</TableHeaderColumn>
              <TableHeaderColumn tooltip="Details">Details</TableHeaderColumn>
              <TableHeaderColumn tooltip="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true} displayRowCheckbox={false}>
            {schedule}
          </TableBody>
        </Table>
        <div className={scheduleCount ? 'hidden' : null}>
          <p className="italic">No deployments scheduled</p>
        </div>
      </div>
    );
  }
}
