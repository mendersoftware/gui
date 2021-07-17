import React, { useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { getDeviceById, getDevicesByStatus } from '../../actions/deviceActions';
import { advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import DeviceConstants from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress } from '../../selectors';
import Tracking from '../../tracking';
import Loader from '../common/loader';

export const DeploymentCompleteTip = ({
  advanceOnboarding,
  anchor,
  getDeviceById,
  getDevicesByStatus,
  setShowCreateArtifactDialog,
  setOnboardingComplete,
  url
}) => {
  const tipRef = useRef(null);

  useEffect(() => {
    ReactTooltip.show(tipRef.current);
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
    <div className="onboard-tip" style={anchor}>
      <a className="tooltip onboard-icon" data-tip data-for="deployment-complete-tip" data-event="click focus" data-event-off="dblclick" ref={tipRef}>
        <CheckCircleIcon />
      </a>
      <ReactTooltip id="deployment-complete-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
        <p>Fantastic! You completed your first deployment!</p>
        <p>Your deployment is finished and your device is now running the updated software!</p>
        <div className="flexbox centered">{!url ? <Loader show={true} /> : <Button variant="contained" onClick={onClick}>{`Go to ${url}`}</Button>}</div>
        <p>and you should see the demo web application actually being run on the device.</p>
        <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
        <a onClick={onClick}>Visit the web app running your device</a>
      </ReactTooltip>
    </div>
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
