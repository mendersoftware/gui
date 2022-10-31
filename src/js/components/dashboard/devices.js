import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getDeviceCount } from '../../actions/deviceActions';
import { setShowConnectingDialog } from '../../actions/userActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOfflineThresholdSettings, getOnboardingState, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import AcceptedDevices from './widgets/accepteddevices';
import PendingDevices from './widgets/pendingdevices';
import RedirectionWidget from './widgets/redirectionwidget';

export const Devices = props => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const anchor = useRef();
  const pendingsRef = useRef();
  const navigate = useNavigate();

  const {
    acceptedDevicesCount,
    advanceOnboarding,
    canManageDevices,
    clickHandle,
    getDeviceCount,
    onboardingState,
    pendingDevicesCount,
    setShowConnectingDialog,
    showHelptips
  } = props;

  useEffect(() => {
    // on render the store might not be updated so we resort to the API and let all later request go through the store
    // to be in sync with the rest of the UI
    refreshDevices();
  }, []);

  const refreshDevices = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    return Promise.all([getDeviceCount(DEVICE_STATES.accepted), getDeviceCount(DEVICE_STATES.pending)]).finally(() => setLoading(false));
  };

  const onConnectClick = () => {
    setShowConnectingDialog(true);
    navigate('/devices/accepted');
  };

  let onboardingComponent = null;
  if (anchor.current) {
    const element = anchor.current.children[anchor.current.children.length - 1];
    const deviceConnectionAnchor = { left: element.offsetLeft + element.offsetWidth / 2, top: element.offsetTop + element.offsetHeight - 50 };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DASHBOARD_ONBOARDING_START, onboardingState, { anchor: deviceConnectionAnchor });
    if (pendingsRef.current) {
      const element = pendingsRef.current.lastChild;
      const pendingsAnchor = {
        left: pendingsRef.current.offsetLeft + element.offsetWidth / 2,
        top: pendingsRef.current.offsetTop + element.offsetHeight
      };
      onboardingComponent = getOnboardingComponentFor(onboardingSteps.DASHBOARD_ONBOARDING_PENDINGS, onboardingState, { anchor: pendingsAnchor });
    }
  }
  return (
    <div className="dashboard margin-bottom-large" ref={anchor}>
      <AcceptedDevices devicesCount={acceptedDevicesCount} onClick={clickHandle} />
      {!!pendingDevicesCount && !acceptedDevicesCount && (
        <PendingDevices
          advanceOnboarding={advanceOnboarding}
          innerRef={pendingsRef}
          isActive={pendingDevicesCount > 0}
          onboardingState={onboardingState}
          onClick={clickHandle}
          pendingDevicesCount={pendingDevicesCount}
          showHelptips={showHelptips}
        />
      )}
      {canManageDevices && (
        <RedirectionWidget content={acceptedDevicesCount || pendingDevicesCount ? '+ connect more devices' : 'Connect a device'} onClick={onConnectClick} />
      )}
      {onboardingComponent}
    </div>
  );
};

const actionCreators = { advanceOnboarding, getDeviceCount, setShowConnectingDialog };

const mapStateToProps = state => {
  const { canManageDevices } = getUserCapabilities(state);
  return {
    canManageDevices,
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    onboardingState: getOnboardingState(state),
    pendingDevicesCount: state.devices.byStatus.pending.total,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Devices);
