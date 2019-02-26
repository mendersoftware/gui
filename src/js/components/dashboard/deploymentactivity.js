import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';

import FontIcon from 'material-ui/FontIcon';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { formatTime } from './../../helpers';

export default class DeploymentActivity extends React.Component {
  getStatusIndicator(deployment) {
    switch (deployment.status) {
      case 'finished':
        return <Link to={`deployments/finished/${deployment.id}`}>View report</Link>;
      case 'inprogress':
        return <Link to={`deployments/active/${deployment.id}`}>View progress</Link>;
      default:
        return null;
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'failed':
        return <FontIcon className="material-icons">warning</FontIcon>;
      case 'finished':
        return <FontIcon className="material-icons">check</FontIcon>;
      default:
        return null;
    }
  }

  render() {
    const self = this;
    return (
      <div>
        <h5>{self.props.title}</h5>
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
            <TableRow>
              {['Devices', 'Started', '', 'Status', ''].map((item, index) => (
                <TableHeaderColumn key={index} tooltip={item}>
                  {item}
                </TableHeaderColumn>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={true} stripedRows={true}>
            {self.props.deployments.map((item, index) => (
              <TableRow key={index}>
                <TableRowColumn>{item.name}</TableRowColumn>
                <TableRowColumn>
                  <Time className="progressTime" value={formatTime(item.created)} format="HH:mm" />
                </TableRowColumn>
                <TableRowColumn>{self.getStatusIcon(item.status)}</TableRowColumn>
                <TableRowColumn>{item.status}</TableRowColumn>
                <TableRowColumn>{self.getStatusIndicator(item)}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
