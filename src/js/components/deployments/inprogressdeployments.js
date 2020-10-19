import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { Refresh as RefreshIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';
import { tryMapDeployments } from '../../helpers';
import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import { clearAllRetryTimers, clearRetryTimer, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

const DEFAULT_PENDING_INPROGRESS_COUNT = 10;
export const minimalRefreshDeploymentsLength = 2000;

const deploymentStatusMap = {
  finished: 'past',
  inprogress: 'progress',
  pending: 'pending'
};

export class Progress extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentRefreshDeploymentLength: refreshDeploymentsLength,
      doneLoading: !!props.progress.length || !!props.pending.length,
      progressPage: 1,
      progressPerPage: DEFAULT_PENDING_INPROGRESS_COUNT,
      pendingPage: 1,
      pendingPerPage: DEFAULT_PENDING_INPROGRESS_COUNT
    };
  }

  componentDidMount() {
    const self = this;
    clearTimeout(self.dynamicTimer);
    self.setupDeploymentsRefresh(minimalRefreshDeploymentsLength);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pendingCount < this.props.pendingCount && Math.abs(this.props.pendingCount - prevProps.pendingCount) === 1) {
      clearTimeout(this.dynamicTimer);
      this.setupDeploymentsRefresh(minimalRefreshDeploymentsLength);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.dynamicTimer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  setupDeploymentsRefresh(refreshLength = this.state.currentRefreshDeploymentLength) {
    const self = this;
    let tasks = [
      self.refreshDeployments(self.state.progressPage, self.state.progressPerPage, 'inprogress'),
      self.refreshDeployments(self.state.pendingPage, self.state.pendingPerPage, 'pending')
    ];
    if (!self.props.onboardingComplete && !self.props.pastDeploymentsCount) {
      tasks.push(self.refreshDeployments(1, 1, 'finished'));
    }
    return Promise.all(tasks).then(() => {
      const currentRefreshDeploymentLength = Math.min(refreshDeploymentsLength, refreshLength * 2);
      self.setState({ currentRefreshDeploymentLength });
      clearTimeout(self.dynamicTimer);
      self.dynamicTimer = setTimeout(() => self.setupDeploymentsRefresh(), currentRefreshDeploymentLength);
    });
  }

  // // deploymentStatus = <inprogress|pending>
  refreshDeployments(page, perPage, deploymentStatus) {
    const self = this;
    const mappedDeploymentStatus = deploymentStatusMap[deploymentStatus];
    return self.setState({ [`${mappedDeploymentStatus}Page`]: page, [`${mappedDeploymentStatus}PerPage`]: perPage }, () =>
      Promise.resolve(self.props.getDeploymentsByStatus(deploymentStatus, page, perPage))
        .then(deploymentsAction => {
          clearRetryTimer(deploymentStatus, self.props.setSnackbar);
          if (deploymentsAction && deploymentsAction[0].total && !deploymentsAction[0].deploymentIds.length) {
            return self.refreshDeployments(...arguments);
          }
        })
        .catch(err => {
          console.log(err);
          var errormsg = err.error || 'Please check your connection';
          setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
        })
        .finally(() => self.setState({ doneLoading: true }))
    );
  }

  abortDeployment(id) {
    const self = this;
    self.props
      .abort(id)
      .then(() =>
        Promise.all([
          self.refreshDeployments(self.state.progressPage, self.state.progressPerPage, 'inprogress'),
          self.refreshDeployments(self.state.pendingPage, self.state.pendingPerPage, 'pending')
        ])
      );
  }

  render() {
    const self = this;

    const { createClick, pastDeploymentsCount, pending, pendingCount, progress, progressCount } = self.props;
    const { doneLoading, pendingPage, pendingPerPage, progressPage, progressPerPage } = self.state;

    let onboardingComponent = null;
    if (!self.props.onboardingComplete) {
      if (this.inprogressRef) {
        const anchor = { left: this.inprogressRef.offsetWidth, top: this.inprogressRef.offsetTop + this.inprogressRef.offsetHeight };
        onboardingComponent = getOnboardingComponentFor('deployments-inprogress', { anchor });
      }
      if (pastDeploymentsCount && getOnboardingStepCompleted('scheduling-release-to-devices') && !getOnboardingStepCompleted('upload-new-artifact-tip')) {
        return <Redirect to="/deployments/finished" />;
      }
    }

    return doneLoading ? (
      <div className="fadeIn">
        {!!progress.length && (
          <div className="margin-left">
            <h4 className="dashboard-header margin-top-large margin-right">
              <span>In progress now</span>
            </h4>
            <div ref={ref => (this.inprogressRef = ref)}>
              <DeploymentsList
                {...self.props}
                abort={id => self.abortDeployment(id)}
                count={progressCount || progress.length}
                headers={defaultHeaders}
                items={progress}
                listClass="margin-right-small"
                page={progressPage}
                pageSize={progressPerPage}
                onChangeRowsPerPage={perPage => self.refreshDeployments(1, perPage, 'inprogress')}
                onChangePage={page => self.refreshDeployments(page, progressPerPage, 'inprogress')}
                type="progress"
              />
            </div>
          </div>
        )}
        {!!onboardingComponent && onboardingComponent}
        {!!(pendingCount && pending.length) && (
          <div className="deployments-pending margin-top">
            <h4 className="dashboard-header margin-small margin-top">
              <span>Pending</span>
            </h4>
            <DeploymentsList
              {...self.props}
              abort={id => self.abortDeployment(id)}
              componentClass="margin-left-small"
              count={pendingCount || pending.length}
              items={pending}
              page={pendingPage}
              pageSize={pendingPerPage}
              onChangeRowsPerPage={perPage => self.refreshDeployments(1, perPage, 'pending')}
              onChangePage={page => self.refreshDeployments(page, pendingPerPage, 'pending')}
              type="pending"
            />
          </div>
        )}
        {!(progressCount || progress.length || pendingCount || pending.length) && (
          <div className={progress.length || !doneLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>Pending and ongoing deployments will appear here. </p>
            <p>
              <a onClick={createClick}>Create a deployment</a> to get started
            </p>
            <RefreshIcon style={{ transform: 'rotateY(-180deg)', fill: '#e3e3e3', width: 111, height: 111 }} />
          </div>
        )}
      </div>
    ) : (
      <Loader show={doneLoading} />
    );
  }
}

const actionCreators = { getDeploymentsByStatus, setSnackbar, selectDeployment };

const mapStateToProps = state => {
  const progress = state.deployments.byStatus.inprogress.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const pending = state.deployments.byStatus.pending.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  return {
    onboardingComplete: state.users.onboarding.complete,
    pastDeploymentsCount: state.deployments.byStatus.finished.deploymentIds.length || state.deployments.byStatus.finished.total,
    pending,
    pendingCount: state.deployments.byStatus.pending.total,
    progress,
    progressCount: state.deployments.byStatus.inprogress.total
  };
};

export default connect(mapStateToProps, actionCreators)(Progress);
