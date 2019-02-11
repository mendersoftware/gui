import React from 'react';
import Time from 'react-time';

// material ui
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

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
          <TableRow hover key={index}>
            <TableCell>{deployment.group}</TableCell>
            <TableCell>{deployment.artifact_name}</TableCell>
            <TableCell>{deployment.devices.length}</TableCell>
            <TableCell>
              <Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" />
            </TableCell>
            <TableCell>
              <Time value={deployment.end_time} format="YYYY/MM/DD HH:mm" />
            </TableCell>
            <TableCell>
              Begins <Time value={deployment.start_time} format="YYYY/MM/DD HH:mm" relative />
            </TableCell>
            <TableCell>
              <div>
                <Button secondary="true" style={{ padding: '0', marginRight: '4', minWidth: '55' }} onClick={() => this._handleEdit(deployment)}>
                  Edit
                </Button>
                <Button style={{ padding: '0', marginLeft: '4', minWidth: '55' }} onClick={() => this._handleRemove(deployment.id)}>
                  Remove
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      }
    }, this);
    return (
      <div>
        <h3>Scheduled deployments</h3>
        <Table className={scheduleCount ? null : 'hidden'}>
          <TableHead>
            <TableRow>
              <TableCell tooltip="Device group">Group</TableCell>
              <TableCell tooltip="Target artifact version">Target artifact</TableCell>
              <TableCell tooltip="Number of devices"># Devices</TableCell>
              <TableCell tooltip="Started">Started</TableCell>
              <TableCell tooltip="Finished">Finished</TableCell>
              <TableCell tooltip="Details">Details</TableCell>
              <TableCell tooltip="Actions" />
            </TableRow>
          </TableHead>
          <TableBody>{schedule}</TableBody>
        </Table>
        <div className={scheduleCount ? 'hidden' : null}>
          <p className="italic">No deployments scheduled</p>
        </div>
      </div>
    );
  }
}
