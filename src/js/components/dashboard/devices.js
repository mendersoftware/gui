import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { getActiveDevices, getAllDevicesByStatus, getDeviceCount } from '../../actions/deviceActions';
import { setShowConnectingDialog } from '../../actions/userActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import AcceptedDevices from './widgets/accepteddevices';
import PendingDevices from './widgets/pendingdevices';
import RedirectionWidget from './widgets/redirectionwidget';
import LinedHeader from '../common/lined-header';

export const Devices = props => {
  const [deltaActivity, setDeltaActivity] = useState(0);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const anchor = useRef();
  const pendingsRef = useRef();

  const {
    acceptedDevicesCount,
    activeDevicesCount,
    advanceOnboarding,
    canManageDevices,
    clickHandle,
    deploymentDeviceLimit,
    getActiveDevices,
    getAllDevicesByStatus,
    getDeviceCount,
    hasFullFiltering,
    inactiveDevicesCount,
    itemsClassName,
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
    if (loading || (!hasFullFiltering && acceptedDevicesCount > deploymentDeviceLimit)) {
      return;
    }
    setLoading(true);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaysIsoString = yesterday.toISOString();
    let tasks = [getDeviceCount(DEVICE_STATES.pending)];
    if (hasFullFiltering) {
      tasks.push(getActiveDevices(yesterdaysIsoString));
    } else {
      tasks.push(getAllDevicesByStatus(DEVICE_STATES.accepted));
    }
    Promise.all(tasks)
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
      <LinedHeader heading="Devices" />
      <div className={`margin-bottom ${itemsClassName}`} ref={anchor}>
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
        {canManageDevices && (
          <RedirectionWidget
            target="/devices/accepted"
            content="Learn how to connect a device"
            buttonContent="Connect a device"
            onClick={() => setShowConnectingDialog(true)}
            isActive={noDevicesAvailable}
          />
        )}
      </div>
      {onboardingComponent ? onboardingComponent : null}
    </div>
  );
};

const actionCreators = { advanceOnboarding, getActiveDevices, getAllDevicesByStatus, getDeviceCount, setShowConnectingDialog };

const mapStateToProps = state => {
  const { hasFullFiltering } = getTenantCapabilities(state);
  const { canManageDevices } = getUserCapabilities(state);
  return {
    activeDevicesCount: state.devices.byStatus.active.total,
    canManageDevices,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    hasFullFiltering,
    inactiveDevicesCount: state.devices.byStatus.inactive.total,
    onboardingState: getOnboardingState(state),
    pendingDevicesCount: state.devices.byStatus.pending.total,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Devices);
