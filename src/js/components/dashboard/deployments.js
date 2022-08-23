import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import RefreshIcon from '@mui/icons-material/Refresh';
import UpdateIcon from '@mui/icons-material/Update';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus } from '../../actions/deploymentActions';
import { DEPLOYMENT_ROUTES, DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState, getUserCapabilities } from '../../selectors';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Loader from '../common/loader';

import { BaseWidget } from './widgets/baseWidget';
import RedirectionWidget from './widgets/redirectionwidget';
import CompletedDeployments from './widgets/completeddeployments';
import useWindowSize from '../../utils/resizehook';
import LinedHeader from '../common/lined-header';

const refreshDeploymentsLength = 30000;

const iconStyles = {
  fontSize: 48,
  opacity: 0.5,
  marginRight: '30px'
};

export const Deployments = ({ canDeploy, clickHandle, finishedCount, inprogressCount, itemsClassName, onboardingState, pendingCount, setSnackbar }) => {
  const [lastDeploymentCheck, setLastDeploymentCheck] = useState();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const deploymentsRef = useRef();
  const timer = useRef();

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    clearInterval(timer.current);
    timer.current = setInterval(getDeployments, refreshDeploymentsLength);
    getDeployments();
    setLastDeploymentCheck(updateDeploymentCutoff(new Date()));
    return () => {
      clearInterval(timer.current);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  const getDeployments = () => {
    const roundedStartDate = Math.round(Date.parse(lastDeploymentCheck || Date.now()) / 1000);
    const updateRequests = Object.keys(DEPLOYMENT_STATES)
      // we need to exclude the scheduled state here as the os version is not able to process these and will prevent the dashboard from loading
      .filter(status => status !== DEPLOYMENT_STATES.scheduled)
      .map(status => getDeploymentsByStatus(status, 1, 1, status === DEPLOYMENT_STATES.finished ? roundedStartDate : undefined));
    return Promise.all(updateRequests)
      .then(() => setLoading(false))
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar));
  };

  const updateDeploymentCutoff = today => {
    const jsonContent = window.localStorage.getItem('deploymentChecker');
    let lastCheck = today;
    try {
      lastCheck = jsonContent ? new Date(JSON.parse(jsonContent)) : today;
    } catch (error) {
      console.warn(error);
    }
    if (!window.sessionStorage.length) {
      window.localStorage.setItem('deploymentChecker', JSON.stringify(today));
      window.sessionStorage.setItem('sessionDeploymentChecker', JSON.stringify(today));
    }
    return lastCheck;
  };

  const pendingWidgetMain = {
    counter: pendingCount,
    header: (
      <div className="flexbox center-aligned">
        <UpdateIcon className="flip-horizontal" style={iconStyles} />
        <div>Pending {pluralize('deployment', pendingCount)}</div>
      </div>
    ),
    targetLabel: 'View details'
  };
  const activeWidgetMain = {
    counter: inprogressCount,
    header: (
      <div className="flexbox center-aligned">
        <RefreshIcon className="flip-horizontal" style={iconStyles} />
        <div>{pluralize('Deployment', inprogressCount)} in progress</div>
      </div>
    ),
    targetLabel: 'View progress'
  };
  let onboardingComponent;
  if (deploymentsRef.current) {
    const anchor = {
      top: deploymentsRef.current.offsetTop + deploymentsRef.current.offsetHeight,
      left: deploymentsRef.current.offsetLeft + deploymentsRef.current.offsetWidth / 2
    };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor });
  }
  return (
    <div>
      <LinedHeader heading="Deployments" />
      <div className="deployments margin-bottom-large">
        {loading ? (
          <Loader show={loading} fade={true} />
        ) : (
          <div className={itemsClassName}>
            <BaseWidget
              className={inprogressCount ? 'current-widget active' : 'current-widget'}
              main={activeWidgetMain}
              onClick={() => clickHandle({ route: DEPLOYMENT_ROUTES.active.route })}
            />
            <BaseWidget
              className={pendingCount ? 'current-widget pending' : 'current-widget'}
              main={pendingWidgetMain}
              onClick={() => clickHandle({ route: DEPLOYMENT_ROUTES.active.route })}
            />
            <CompletedDeployments onClick={clickHandle} finishedCount={finishedCount} cutoffDate={lastDeploymentCheck} innerRef={deploymentsRef} />
            {canDeploy && (
              <RedirectionWidget
                target={`${DEPLOYMENT_ROUTES.active.route}?open=true`}
                content="Create a new deployment to update a group of devices"
                buttonContent="Create a deployment"
                onClick={() => clickHandle({ route: `${DEPLOYMENT_ROUTES.active.route}?open=true` })}
                isActive={false}
              />
            )}
          </div>
        )}
        {onboardingComponent}
      </div>
    </div>
  );
};

const actionCreators = { getDeploymentsByStatus, setSnackbar };

const mapStateToProps = state => {
  const { canDeploy } = getUserCapabilities(state);
  return {
    canDeploy,
    finishedCount: state.deployments.byStatus.finished.total,
    inprogressCount: state.deployments.byStatus.inprogress.total,
    onboardingState: getOnboardingState(state),
    pendingCount: state.deployments.byStatus.pending.total
  };
};

export default connect(mapStateToProps, actionCreators)(Deployments);
