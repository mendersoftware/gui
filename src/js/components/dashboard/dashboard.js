import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Deployments from './deployments';
import Devices from './devices';
import SoftwareDistribution from './software-distribution';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  row: { flexWrap: 'wrap', maxWidth: '85vw' }
}));

var timeoutID = null;

export const Dashboard = ({ acceptedDevicesCount, currentUser, deploymentDeviceLimit, onboardingState, setSnackbar }) => {
  const navigate = useNavigate();
  const { classes } = useStyles();

  useEffect(() => {
    if (!currentUser || !onboardingState.showTips) {
      return;
    }
    if (timeoutID !== null) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      const notification = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, onboardingState, { setSnackbar });
      !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
    }, 400);
  }, [currentUser, JSON.stringify(onboardingState)]);

  const handleClick = params => {
    let redirect;
    if (params.route === 'deployments') {
      let URIParams = params.open;
      URIParams = params.id ? `${URIParams}&id=${params.id}` : URIParams;
      redirect = `/deployments/${params.tab || DEPLOYMENT_ROUTES.active.key}/open=${encodeURIComponent(URIParams)}`;
    } else {
      redirect = params.route;
    }
    navigate(redirect, { replace: true });
  };

  return currentUser ? (
    <div className="dashboard flexbox column">
      <Devices className={`flexbox ${classes.row}`} clickHandle={handleClick} />
      <div className="two-columns" style={{ gridTemplateColumns: '4fr 5fr' }}>
        <Deployments itemsClassName={`flexbox ${classes.row}`} clickHandle={handleClick} />
        {acceptedDevicesCount < deploymentDeviceLimit ? <SoftwareDistribution /> : <div />}
      </div>
    </div>
  ) : (
    <div className="flexbox centered" style={{ height: '75%' }}>
      <Loader show={true} />
    </div>
  );
};

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    currentUser: state.users.currentUser,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    onboardingState: getOnboardingState(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Dashboard);
