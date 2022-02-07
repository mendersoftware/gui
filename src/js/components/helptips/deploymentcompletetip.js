import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { getDeviceById, getDevicesByStatus } from '../../actions/deviceActions';
import { advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import DeviceConstants from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress } from '../../selectors';
import Tracking from '../../tracking';
import Loader from '../common/loader';
import { MenderTooltipClickable } from '../common/mendertooltip';

export const DeploymentCompleteTip = ({
  advanceOnboarding,
  anchor,
  getDeviceById,
  getDevicesByStatus,
  setShowCreateArtifactDialog,
  setOnboardingComplete,
  url
}) => {
  useEffect(() => {
    getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted).then(tasks => tasks[tasks.length - 1].deviceAccu.ids.map(getDeviceById));
    Tracking.event({ category: 'onboarding', action: onboardingSteps.DEPLOYMENTS_PAST_COMPLETED });
  }, []);

  const onClick = () => {
    const parametrizedAddress = `${url}/index.html?source=${encodeURIComponent(window.location)}`;
    window.open(parametrizedAddress, '_blank');
    advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE);
    setOnboardingComplete(false);
    setShowCreateArtifactDialog(true);
    window.location.replace('#/releases');
  };

  return (
    <MenderTooltipClickable
      className="tooltip onboard-icon onboard-tip"
      id={onboardingSteps.DEPLOYMENTS_PAST_COMPLETED}
      onboarding
      startOpen
      style={anchor}
      PopperProps={{ style: { marginLeft: -30, marginTop: -20 } }}
      title={
        <div className="content">
          <p>Fantastic! You completed your first deployment!</p>
          <p>Your deployment is finished and your device is now running the updated software!</p>
          <div className="flexbox centered">{!url ? <Loader show={true} /> : <Button variant="contained" onClick={onClick}>{`Go to ${url}`}</Button>}</div>
          <p>and you should see the demo web application actually being run on the device.</p>
          <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
          <a onClick={onClick}>Visit the web app running your device</a>
        </div>
      }
    >
      <CheckCircleIcon />
    </MenderTooltipClickable>
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ advanceOnboarding, getDeviceById, getDevicesByStatus, setOnboardingComplete, setShowCreateArtifactDialog }, dispatch);
};

const mapStateToProps = (state, ownProps) => {
  return {
    url: getDemoDeviceAddress(state) || ownProps.targetUrl
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentCompleteTip);
