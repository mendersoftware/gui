import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import HelpIcon from '@material-ui/icons/Help';

import { CreateDeployment, ProgressDeployment } from '../helptips/helptooltips';
import DeploymentStatus from './deploymentstatus';
import Loader from '../common/loader';
import { formatTime } from '../../helpers';

export default class Progress extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      retry: false,
      pageSize: 20
    };
  }
  _progressCellClick(rowNumber) {
    this.props.openReport(rowNumber, 'progress');
  }

  _handlePageChange(pageNo) {
    this.props.refreshProgress(pageNo);
  }
  render() {
    // get statistics for each in progress
    var progressMap = this.props.progress.map(function(deployment, index) {
      var status = <DeploymentStatus isActiveTab={this.props.isActiveTab} refresh={true} id={deployment.id} />;
      return (
        <TableRow style={{ height: '52px' }} hover key={index}>
          <TableCell>{deployment.artifact_name}</TableCell>
          <TableCell>{deployment.name}</TableCell>
          <TableCell>
            <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableCell>
          <TableCell style={{ overflow: 'visible', width: '350px' }}>{status}</TableCell>
        </TableRow>
      );
    }, this);

    return (
      <div className="fadeIn">
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          {progressMap.length ? (
            <div>
              <h3>In progress</h3>
              <Table className={progressMap.length ? null : 'hidden'} style={{ overflow: 'visible' }}>
                <TableHead>
                  <TableRow style={{ overflow: 'visible' }} onClick={row => this._progressCellClick(row)}>
                    <TableCell>Updating to</TableCell>
                    <TableCell>Group</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell style={{ textAlign: 'right', width: '100px' }}># Devices</TableCell>
                    <TableCell style={{ width: '350px' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="clickable" style={{ overflow: 'visible' }}>
                  {progressMap}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {this.props.count > this.props.progress.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.state.pageSize}
              current={this.props.page || 1}
              total={this.props.count}
              onChange={page => this._handlePageChange(page)}
            />
          ) : null}

          {this.props.count || this.props.pendingCount ? null : (
            <div className={progressMap.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
              <p>Pending and ongoing deployments will appear here. </p>
              <p>
                <a onClick={this.props.createClick}>Create a deployment</a> to get started
              </p>
              <img src="assets/img/deployments.png" alt="In progress" />
            </div>
          )}

          {!this.props.loading && this.props.showHelptips && (!this.props.hasDeployments || this.props.progress.length) ? (
            // if first deployment not created, or if there is one in progress, show tip
            <div>
              <div
                id="onboard-12"
                className={this.props.hasDeployments ? 'tooltip help' : 'tooltip help highlight'}
                data-tip
                data-for="create-deployment-tip"
                data-event="click focus"
              >
                <HelpIcon />
              </div>
              <ReactTooltip id="create-deployment-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                {!this.props.hasDeployments ? (
                  <CreateDeployment devices={this.props.devices.length} artifacts={this.props.hasArtifacts} />
                ) : (
                  <ProgressDeployment />
                )}
              </ReactTooltip>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
