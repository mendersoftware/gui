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

import BaseOnboardingTip from '../helptips/baseonboardingtip';
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

  render() {
    // get statistics for each in progress
    var progressMap = this.props.progress.map(function(deployment, index) {
      var status = <DeploymentStatus isActiveTab={this.props.isActiveTab} refresh={true} id={deployment.id} />;
      return (
        <TableRow style={{ height: '52px' }} hover key={index} onClick={() => this.props.openReport(index, 'progress')}>
          <TableCell>{deployment.artifact_name}</TableCell>
          <TableCell>{deployment.name}</TableCell>
          <TableCell>
            <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableCell>
          <TableCell style={{ overflow: 'visible', minWidth: '400px' }}>{status}</TableCell>
        </TableRow>
      );
    }, this);

    let onboardingAnchor = { left: 200, top: 0 };
    if (this.inprogressRef) {
      onboardingAnchor.top = this.inprogressRef.offsetTop + this.inprogressRef.offsetHeight;
    }
    return (
      <div className="fadeIn">
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          {progressMap.length ? (
            <div ref={ref => (this.inprogressRef = ref)}>
              <h3>In progress</h3>
              {progressMap.length ? (
                <Table style={{ overflow: 'visible' }}>
                  <TableHead>
                    <TableRow style={{ overflow: 'visible' }}>
                      <TableCell>Updating to</TableCell>
                      <TableCell>Group</TableCell>
                      <TableCell>Started</TableCell>
                      <TableCell style={{ textAlign: 'right', width: '100px' }}># Devices</TableCell>
                      <TableCell style={{ minWidth: '400px' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody style={{ cursor: 'pointer', overflow: 'visible' }}>{progressMap}</TableBody>
                </Table>
              ) : null}
            </div>
          ) : null}

          {this.props.count > this.props.progress.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.state.pageSize}
              current={this.props.page || 1}
              total={this.props.count}
              onChange={page => this.props.refreshProgress(page)}
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

          {this.props.showHelptips && this.props.progress.length ? (
            <BaseOnboardingTip id={11} progress={2} anchor={onboardingAnchor} component={<div>Your deployment is in progress. Click to view a report</div>} />
          ) : null}
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
