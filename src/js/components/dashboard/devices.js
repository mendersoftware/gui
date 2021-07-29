import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { getAllDevicesByStatus, getDeviceCount } from '../../actions/deviceActions';
import { setShowConnectingDialog } from '../../actions/userActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import AcceptedDevices from './widgets/accepteddevices';
import PendingDevices from './widgets/pendingdevices';
import RedirectionWidget from './widgets/redirectionwidget';

export const Devices = props => {
  const [deltaActivity, setDeltaActivity] = useState(0);
  const [loading, setLoading] = useState();
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const anchor = useRef();
  const pendingsRef = useRef();

  const {
    acceptedDevicesCount,
    activeDevicesCount,
    advanceOnboarding,
    clickHandle,
    deploymentDeviceLimit,
    getAllDevicesByStatus,
    getDeviceCount,
    inactiveDevicesCount,
    onboardingState,
    pendingDevicesCount,
    setShowConnectingDialog,
    showHelptips,
    styles
  } = props;

  useEffect(() => {
    // on render the store might not be updated so we resort to the API and let all later request go through the store
    // to be in sync with the rest of the UI
    refreshDevices();
  }, []);

  const refreshDevices = () => {
    if (loading || acceptedDevicesCount > deploymentDeviceLimit) {
      return;
    }
    setLoading(true);
    Promise.all([getAllDevicesByStatus(DEVICE_STATES.accepted), getDeviceCount(DEVICE_STATES.pending)])
      .then(() => {
        const deltaActivity = updateDeviceActivityHistory(activeDevicesCount);
        setDeltaActivity(deltaActivity);
      })
      .finally(() => setLoading(false));
  };

  const updateDeviceActivityHistory = deviceCount => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();
    const jsonContent = window.localStorage.getItem('dailyDeviceActivityCount');
    let history = [];
    try {
      history = jsonContent ? JSON.parse(jsonContent) : [];
    } catch (error) {
      console.warn(error);
      window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history));
    }
    const yesterdaysDate = yesterday.toISOString().split('T')[0];
    const todaysDate = today.toISOString().split('T')[0];
    const result = history.reduce(
      (accu, item) => {
        if (item.date < yesterdaysDate) {
          accu.previousCount = item.count;
        }
        if (item.date === todaysDate) {
          accu.newDay = false;
        }
        return accu;
      },
      { previousCount: 0, newDay: true }
    );
    const previousCount = result.previousCount;
    if (result.newDay) {
      history.unshift({ count: deviceCount, date: todaysDate });
    }
    window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history.slice(0, 7)));
    return deviceCount - previousCount;
  };

  const noDevicesAvailable = acceptedDevicesCount + pendingDevicesCount <= 0;
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
    <div>
      <h4 className="dashboard-header">
        <span>Devices</span>
      </h4>
      <div style={Object.assign({ marginBottom: 30 }, styles)} ref={anchor}>
        {!!pendingDevicesCount && (
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
        <AcceptedDevices
          deviceLimit={deploymentDeviceLimit}
          devicesCount={acceptedDevicesCount}
          inactiveCount={inactiveDevicesCount}
          delta={deltaActivity}
          onClick={clickHandle}
        />
        <RedirectionWidget
          target="/devices/accepted"
          content="Learn how to connect a device"
          buttonContent="Connect a device"
          onClick={() => setShowConnectingDialog(true)}
          isActive={noDevicesAvailable}
        />
      </div>
      {onboardingComponent ? onboardingComponent : null}
    </div>
  );
};

const actionCreators = { advanceOnboarding, getAllDevicesByStatus, getDeviceCount, setShowConnectingDialog };

const mapStateToProps = state => {
  return {
    activeDevicesCount: state.devices.byStatus.active.total,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    inactiveDevicesCount: state.devices.byStatus.inactive.total,
    onboardingState: getOnboardingState(state),
    pendingDevicesCount: state.devices.byStatus.pending.total,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Devices);
