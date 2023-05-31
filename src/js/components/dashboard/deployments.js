// Copyright 2015 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus } from '../../actions/deploymentActions';
import { DEPLOYMENT_ROUTES, DEPLOYMENT_STATES, deploymentDisplayStates } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { DEPLOYMENT_CUTOFF, getOnboardingState, getRecentDeployments, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import { BaseDeploymentsWidget, CompletedDeployments } from './widgets/deployments';
import RedirectionWidget from './widgets/redirectionwidget';

const refreshDeploymentsLength = 30000;

// we need to exclude the scheduled state here as the os version is not able to process these and would prevent the dashboard from loading
const stateMap = {
  [DEPLOYMENT_STATES.pending]: BaseDeploymentsWidget,
  [DEPLOYMENT_STATES.inprogress]: BaseDeploymentsWidget,
  [DEPLOYMENT_STATES.finished]: CompletedDeployments
};

export const Deployments = ({
  canDeploy,
  className = '',
  clickHandle,
  deployments,
  deploymentsCount,
  getDeploymentsByStatus,
  onboardingState,
  setSnackbar
}) => {
  const [loading, setLoading] = useState(!deploymentsCount);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const deploymentsRef = useRef();
  const timer = useRef();

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    clearInterval(timer.current);
    timer.current = setInterval(getDeployments, refreshDeploymentsLength);
    getDeployments();
    return () => {
      clearInterval(timer.current);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  const getDeployments = () =>
    Promise.all(Object.keys(stateMap).map(status => getDeploymentsByStatus(status, 1, DEPLOYMENT_CUTOFF)))
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar))
      .finally(() => setLoading(false));

  let onboardingComponent;
  if (deploymentsRef.current) {
    const anchor = {
      top: deploymentsRef.current.offsetTop + deploymentsRef.current.offsetHeight,
      left: deploymentsRef.current.offsetLeft + deploymentsRef.current.offsetWidth / 2
    };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor });
  }
  return (
    <div className={`${className} deployments`}>
      {loading ? (
        <Loader show={loading} fade={true} />
      ) : (
        <div className="dashboard flexbox column" ref={deploymentsRef} style={{ gridTemplateColumns: '1fr', rowGap: 10 }}>
          <h4 className={`${deploymentsCount ? 'margin-bottom-none' : 'margin-top-none'} margin-left-small`}>
            {deploymentsCount ? 'Recent deployments' : 'Deployments'}
          </h4>
          {deploymentsCount ? (
            <>
              {Object.entries(stateMap).reduce((accu, [key, Component]) => {
                if (!deployments[key]) {
                  return accu;
                }
                accu.push(
                  <React.Fragment key={key}>
                    <h5 className="margin-bottom-none">{deploymentDisplayStates[key]}</h5>
                    <Component deployments={deployments[key]} state={key} onClick={clickHandle} />
                  </React.Fragment>
                );
                return accu;
              }, [])}
              <Link className="margin-top" to="/deployments">
                See all deployments
              </Link>
            </>
          ) : (
            canDeploy && (
              <RedirectionWidget
                content="Create a new deployment to update a group of devices"
                onClick={() => clickHandle({ route: `${DEPLOYMENT_ROUTES.active.route}?open=true` })}
              />
            )
          )}
        </div>
      )}
      {onboardingComponent}
    </div>
  );
};

const actionCreators = { getDeploymentsByStatus, setSnackbar };

const mapStateToProps = state => {
  const { canDeploy } = getUserCapabilities(state);
  const { total: deploymentsCount, ...deployments } = getRecentDeployments(state);
  return {
    canDeploy,
    deploymentsCount,
    deployments,
    onboardingState: getOnboardingState(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Deployments);
