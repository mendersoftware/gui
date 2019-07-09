import React from 'react';
import { Redirect } from 'react-router-dom';
import Time from 'react-time';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import DeploymentStatus from './deploymentstatus';
import Loader from '../common/loader';
import { formatTime } from '../../helpers';
import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import AppStore from '../../stores/app-store';

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

    let onboardingComponent = null;
    if (!AppStore.getOnboardingComplete() && this.inprogressRef) {
      const anchor = { left: 200, top: this.inprogressRef.offsetTop + this.inprogressRef.offsetHeight };
      onboardingComponent = getOnboardingComponentFor('deployments-inprogress', { anchor });
      if (
        AppStore.getPastDeployments() &&
        getOnboardingStepCompleted('scheduling-release-to-devices') &&
        !getOnboardingStepCompleted('upload-new-artifact-tip')
      ) {
        return <Redirect to="/deployments/finished" />;
      }
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

          {onboardingComponent ? onboardingComponent : null}
        </div>
      </div>
    );
  }
}
