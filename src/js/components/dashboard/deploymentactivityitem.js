import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';

import FontIcon from 'material-ui/FontIcon';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import AppActions from '../../actions/app-actions';
import { formatTime } from './../../helpers';
import { LinearProgress } from 'material-ui';

export default class DeploymentActivity extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      deployment: this.props.deployment,
      progress: 0,
      status: this.props.deployment.status
    };
  }

  componentDidMount() {
    var self = this;
    const deployment = self.state.deployment;
    const callback = statistics => {
      const skipped = statistics.noartifact + statistics.aborted + statistics.decommissioned + statistics['already-installed'];
      let state = { progress: 0, skipped, status: deployment.status };
      if (deployment.status === 'finished') {
        state.status = statistics.success ? 'completed' : 'failed';
      }
      if (deployment.status === 'inprogress') {
        state.progress = ((self.state.deployment.device_count - statistics.pending) / self.state.deployment.device_count) * 100;
      }
      self.setState(state);
    };
    AppActions.getSingleDeploymentStats(deployment.id, callback);
  }

  getStatusIndicator(deployment) {
    const path = `open=true&id=${deployment.id}`;
    const params = encodeURIComponent(path);
    switch (deployment.status) {
      case 'finished':
        return <Link to={`deployments/finished/${params}`}>View report</Link>;
      case 'inprogress':
        return <Link to={`deployments/active/${params}`}>View progress</Link>;
      default:
        return null;
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'failed':
        return <FontIcon className="material-icons red">error_outline</FontIcon>;
      case 'completed':
        return <FontIcon className="material-icons green">check_circle_outline</FontIcon>;
      default:
        return null;
    }
  }

  render() {
    const self = this;
    const { deployment, status, progress } = self.state;
    const isStriped = self.props.rowNumber % 2 === 0;
    return (
      <TableRow className={isStriped ? 'lightestgrey' : null} key={self.props.key} style={self.props.style}>
        <TableRowColumn style={self.props.style}>{deployment.name}</TableRowColumn>
        <TableRowColumn style={self.props.style}>
          <Time className="progressTime" value={formatTime(deployment.created)} format="HH:mm" />
        </TableRowColumn>
        <TableRowColumn style={Object.assign({ paddingRight: '0', textAlign: 'right', width: self.props.tinyWidth }, self.props.style)}>
          {self.getStatusIcon(status)}
        </TableRowColumn>
        <TableRowColumn style={self.props.style}>
          <div className="capitalized flexbox">
            <span className="statusText">{deployment.status}</span>
            {self.getStatusIndicator(deployment)}
          </div>
          {status === 'inprogress' ? <LinearProgress mode="determinate" style={{ marginTop: '5px', marginBottom: '-10px' }} value={progress} /> : null}
        </TableRowColumn>
      </TableRow>
    );
  }
}
