import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Refresh as RefreshIcon } from '@mui/icons-material';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, setDeploymentsState } from '../../actions/deploymentActions';
import { DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { tryMapDeployments } from '../../helpers';
import { getOnboardingState, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import { clearAllRetryTimers, clearRetryTimer, setRetryTimer } from '../../utils/retrytimer';
import LinedHeader from '../common/lined-header';
import Loader from '../common/loader';
import DeploymentsList from './deploymentslist';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

export const minimalRefreshDeploymentsLength = 2000;

export const Progress = props => {
  const {
    abort,
    canDeploy,
    createClick,
    getDeploymentsByStatus,
    onboardingState,
    pastDeploymentsCount,
    pending,
    pendingState,
    progress,
    progressState,
    setDeploymentsState,
    setSnackbar
  } = props;
  const { page: progressPage, perPage: progressPerPage, total: progressCount } = progressState;
  const { page: pendingPage, perPage: pendingPerPage, total: pendingCount } = pendingState;

  const [currentRefreshDeploymentLength, setCurrentRefreshDeploymentLength] = useState(refreshDeploymentsLength);
  const [doneLoading, setDoneLoading] = useState(!!(progressCount || pendingCount));
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const inprogressRef = useRef();
  const dynamicTimer = useRef();

  useEffect(() => {
    clearTimeout(dynamicTimer.current);
    setupDeploymentsRefresh(minimalRefreshDeploymentsLength);
    return () => {
      clearTimeout(dynamicTimer.current);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  useEffect(() => {
    clearTimeout(dynamicTimer.current);
    setupDeploymentsRefresh(minimalRefreshDeploymentsLength);
    return () => {
      clearTimeout(dynamicTimer.current);
    };
  }, [pendingCount]);

  const setupDeploymentsRefresh = (refreshLength = currentRefreshDeploymentLength) => {
    let tasks = [
      refreshDeployments(progressPage, progressPerPage, DEPLOYMENT_STATES.inprogress),
      refreshDeployments(pendingPage, pendingPerPage, DEPLOYMENT_STATES.pending)
    ];
    if (!onboardingState.complete && !pastDeploymentsCount) {
      // retrieve past deployments outside of the regular refresh cycle to not change the selection state for past deployments
      getDeploymentsByStatus(DEPLOYMENT_STATES.finished, 1, 1, undefined, undefined, undefined, undefined, false);
    }
    return Promise.all(tasks)
      .then(() => {
        const currentRefreshDeploymentLength = Math.min(refreshDeploymentsLength, refreshLength * 2);
        setCurrentRefreshDeploymentLength(currentRefreshDeploymentLength);
        clearTimeout(dynamicTimer.current);
        dynamicTimer.current = setTimeout(setupDeploymentsRefresh, currentRefreshDeploymentLength);
      })
      .finally(() => setDoneLoading(true));
  };

  // deploymentStatus = <inprogress|pending>
  const refreshDeployments = (page, perPage, deploymentStatus) => {
    setDeploymentsState({ [deploymentStatus]: { page, perPage } });
    return getDeploymentsByStatus(deploymentStatus, page, perPage)
      .then(deploymentsAction => {
        clearRetryTimer(deploymentStatus, setSnackbar);
        const { total, deploymentIds } = deploymentsAction[deploymentsAction.length - 1];
        if (total && !deploymentIds.length) {
          return refreshDeployments(page, perPage, deploymentStatus);
        }
      })
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar))
      .finally(() => setDoneLoading(true));
  };

  const abortDeployment = id =>
    abort(id).then(() =>
      Promise.all([
        refreshDeployments(progressPage, progressPerPage, DEPLOYMENT_STATES.inprogress),
        refreshDeployments(pendingPage, pendingPerPage, DEPLOYMENT_STATES.pending)
      ])
    );

  let onboardingComponent = null;
  if (!onboardingState.complete && inprogressRef.current) {
    const anchor = { left: inprogressRef.current.offsetWidth - 100, top: inprogressRef.current.offsetTop + inprogressRef.current.offsetHeight };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_INPROGRESS, onboardingState, { anchor });
  }

  return doneLoading ? (
    <div className="fadeIn">
      {!!progress.length && (
        <div className="margin-left">
          <LinedHeader className="margin-top-large  margin-right" heading="In progress now" />
          {/* <div ref={inprogressRef}> */}
          <DeploymentsList
            {...props}
            abort={abortDeployment}
            count={progressCount}
            items={progress}
            listClass="margin-right-small"
            page={progressPage}
            pageSize={progressPerPage}
            onChangeRowsPerPage={perPage => refreshDeployments(1, perPage, DEPLOYMENT_STATES.inprogress)}
            onChangePage={page => refreshDeployments(page, progressPerPage, DEPLOYMENT_STATES.inprogress)}
            type={DEPLOYMENT_STATES.inprogress}
          />
          {/* </div> */}
        </div>
      )}
      {!!onboardingComponent && onboardingComponent}
      {!!pending.length && (
        <div className="deployments-pending margin-top margin-bottom-large">
          <LinedHeader className="margin-small margin-top" heading="Pending" />
          <DeploymentsList
            {...props}
            abort={abortDeployment}
            componentClass="margin-left-small"
            count={pendingCount}
            items={pending}
            page={pendingPage}
            pageSize={pendingPerPage}
            onChangeRowsPerPage={perPage => refreshDeployments(1, perPage, DEPLOYMENT_STATES.pending)}
            onChangePage={page => refreshDeployments(page, pendingPerPage, DEPLOYMENT_STATES.pending)}
            type={DEPLOYMENT_STATES.pending}
          />
        </div>
      )}
      {!(progressCount || pendingCount) && (
        <div className="dashboard-placeholder">
          <p>Pending and ongoing deployments will appear here. </p>
          {canDeploy && (
            <p>
              <a onClick={createClick}>Create a deployment</a> to get started
            </p>
          )}
          <RefreshIcon style={{ transform: 'rotateY(-180deg)', fill: '#e3e3e3', width: 111, height: 111 }} />
        </div>
      )}
    </div>
  ) : (
    <Loader show={doneLoading} />
  );
};

const actionCreators = { getDeploymentsByStatus, setDeploymentsState, setSnackbar };

const mapStateToProps = state => {
  const progress = state.deployments.selectionState.inprogress.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const pending = state.deployments.selectionState.pending.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const { canDeploy } = getUserCapabilities(state);
  return {
    canDeploy,
    onboardingState: getOnboardingState(state),
    pastDeploymentsCount: state.deployments.byStatus.finished.total,
    pending,
    pendingState: state.deployments.selectionState.pending,
    progress,
    progressState: state.deployments.selectionState.inprogress
  };
};

export default connect(mapStateToProps, actionCreators)(Progress);
