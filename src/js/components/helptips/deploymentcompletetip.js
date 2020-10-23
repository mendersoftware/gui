import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog, setShowOnboardingHelp } from '../../actions/onboardingActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress } from '../../selectors';
import Loader from '../common/loader';

export const DeploymentCompleteTip = ({ advanceOnboarding, setShowCreateArtifactDialog, setOnboardingComplete, setShowOnboardingHelp, url }) => {
  const onClose = () => {
    setShowOnboardingHelp(false);
    setOnboardingComplete(false);
  };

  const onClick = () => {
    const parametrizedAddress = `${url}/index.html?source=${encodeURIComponent(window.location)}`;
    window.open(parametrizedAddress, '_blank');
    advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE);
    setShowCreateArtifactDialog(true);
    window.location.replace('#/releases');
    onClose();
  };

  const loading = !url;
  return (
    <div>
      <p>Fantastic! You completed your first deployment!</p>
      <p>Your deployment is finished and your device is now running the updated software!</p>
      <div className="flexbox centered">{loading ? <Loader show={true} /> : <Button variant="contained" onClick={onClick}>{`Go to ${url}`}</Button>}</div>
      <p>and you should see the demo web application actually being run on the device.</p>
      <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
      {loading ? <Loader show={true} /> : <a onClick={onClick}>Visit the web app running your device</a>}
    </div>
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ advanceOnboarding, getDevicesByStatus, setOnboardingComplete, setShowCreateArtifactDialog, setShowOnboardingHelp }, dispatch);
};

const mapStateToProps = (state, ownProps) => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds.map(id => state.devices.byId[id]),
    currentUser: state.users.currentUser,
    url: getDemoDeviceAddress(state) || ownProps.targetUrl
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentCompleteTip);
