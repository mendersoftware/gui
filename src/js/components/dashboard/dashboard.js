import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { setSnackbar } from '../../actions/appActions';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import Deployments from './deployments';
import Devices from './devices';
import SoftwareDistribution from './software-distribution';
import { styles } from './widgets/baseWidget';

const rowBaseStyles = {
  container: {
    flexWrap: 'wrap',
    maxWidth: '85vw'
  }
};
const rowStyles = { ...rowBaseStyles.container, ...styles.rowStyle };

export const Dashboard = ({ acceptedDevicesCount, currentUser, deploymentDeviceLimit, onboardingState, setSnackbar }) => {
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (!currentUser || !onboardingState.showTips) {
      return;
    }
    setTimeout(() => {
      const notification = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, onboardingState);
      !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
    }, 400);
  }, [currentUser, onboardingState]);

  const handleClick = params => {
    let redirect;
    switch (params.route) {
      case 'deployments': {
        let URIParams = params.open;
        URIParams = params.id ? `${URIParams}&id=${params.id}` : URIParams;
        redirect = `/deployments/${params.tab || 'progress'}/open=${encodeURIComponent(URIParams)}`;
        break;
      }
      case 'devices':
        redirect = `/devices/${params.status ? encodeURIComponent('status=' + params.status) : ''}`;
        break;
      case 'devices/pending':
        redirect = '/devices/pending';
        break;
      default:
        redirect = params.route;
    }
    setRedirect(redirect);
  };

  if (redirect) {
    return <Redirect to={redirect} />;
  }
  return currentUser ? (
    <div className="dashboard">
      <Devices styles={rowStyles} clickHandle={handleClick} />
      <div className="two-columns" style={{ gridTemplateColumns: '4fr 5fr' }}>
        <Deployments styles={rowStyles} clickHandle={handleClick} />
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
