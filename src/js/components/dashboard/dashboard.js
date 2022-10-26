import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { makeStyles } from 'tss-react/mui';

import { setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Deployments from './deployments';
import Devices from './devices';
import SoftwareDistribution from './software-distribution';
import { TIMEOUTS } from '../../constants/appConstants';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';

const useStyles = makeStyles()(theme => ({
  board: {
    columnGap: theme.spacing(6),
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: '80vh'
  },
  left: { flexGrow: 1, flexBasis: 0, minWidth: '60vw', display: 'flex', rowGap: theme.spacing(6), flexDirection: 'column' },
  right: { flexGrow: 1, minWidth: 400 },
  row: { flexWrap: 'wrap', maxWidth: '85vw' }
}));

export const Dashboard = ({ acceptedDevicesCount, currentUser, deploymentDeviceLimit, onboardingState, setSnackbar }) => {
  const navigate = useNavigate();
  const { classes } = useStyles();
  const timer = useRef();

  useEffect(() => {
    if (!currentUser || !onboardingState.showTips) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const notification = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, onboardingState, { setSnackbar });
      !!notification && setSnackbar('open', TIMEOUTS.refreshDefault, '', notification, () => {}, true);
    }, 400);
  }, [currentUser, JSON.stringify(onboardingState)]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleClick = params => {
    let redirect;
    if (params.route === 'deployments') {
      let URIParams = params.open;
      URIParams = params.id ? `${URIParams}&id=${params.id}` : URIParams;
      redirect = `/deployments/${params.tab || DEPLOYMENT_ROUTES.active.key}/open=${encodeURIComponent(URIParams)}`;
    } else {
      redirect = params.route;
    }
    navigate(redirect);
  };

  return (
    <>
      <h4 className="margin-left-small">Dashboard</h4>
      {currentUser ? (
        <div className={`dashboard ${classes.board}`}>
          <div className={classes.left}>
            <Devices className="flexbox column" clickHandle={handleClick} />
            {acceptedDevicesCount < deploymentDeviceLimit ? <SoftwareDistribution /> : <div />}
          </div>
          <Deployments className={classes.right} itemsClassName="flexbox column" clickHandle={handleClick} />
        </div>
      ) : (
        <div className="flexbox centered" style={{ height: '75%' }}>
          <Loader show={true} />
        </div>
      )}
    </>
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
