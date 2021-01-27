import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { decommissionDevice } from '../../actions/deviceActions';
import { getReleases } from '../../actions/releaseActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { getDocsVersion, getTenantCapabilities } from '../../selectors';
import { AuthButton } from '../helptips/helptooltips';
import AuthsetsDialog from './authsets';
import TerminalDialog from './terminal';
import AuthStatus from './device-details/authstatus';
import DeviceConfiguration from './device-details/configuration';
import DeviceInventory from './device-details/deviceinventory';
import DeviceIdentity from './device-details/identity';
import DeviceInventoryLoader from './device-details/deviceinventoryloader';
import DeviceConnection from './device-details/connection';

export const ExpandedDevice = ({
  className,
  decommissionDevice,
  device,
  docsVersion,
  getReleases,
  hasDeviceConfig,
  hasDeviceConnect,
  highlightHelp,
  id_attribute,
  id_value,
  limitMaxed,
  refreshDevices,
  setSnackbar,
  showHelptips,
  unauthorized
}) => {
  const { attributes, status = DEVICE_STATES.accepted } = device;

  const [showAuthsetsDialog, setShowAuthsetsDialog] = useState(false);
  const [socketClosed, setSocketClosed] = useState(true);
  const [terminal, setTerminal] = useState(false);

  useEffect(() => {
    if (status === DEVICE_STATES.accepted) {
      getReleases();
    }
  }, []);

  const toggleAuthsets = (authsets = !showAuthsetsDialog, shouldUpdate = false) => {
    setShowAuthsetsDialog(authsets);
    refreshDevices(shouldUpdate);
  };

  const onDecommissionDevice = device_id => {
    // close dialog!
    // close expanded device
    // trigger reset of list!
    return decommissionDevice(device_id)
      .then(() => toggleAuthsets(false))
      .finally(() => refreshDevices(true));
  };

  const launchTerminal = () => {
    setSocketClosed(false);
    setTerminal(true);
  };

  const onConfigSubmit = () => {
    return new Promise((resolve, reject) => setTimeout(() => reject(), 10000));
  };

  const waiting = !(attributes && Object.values(attributes).some(i => i));
  return (
    <div className={className}>
      <div key="deviceinfo">
        <div className="device-identity bordered">
          <DeviceIdentity device={device} setSnackbar={setSnackbar} />
          <AuthStatus
            device={device}
            toggleAuthsets={() => {
              toggleAuthsets(true);
              setSnackbar('');
            }}
          />
        </div>
        {status === DEVICE_STATES.accepted && (
          <>
            {hasDeviceConfig && <DeviceConfiguration device={device} submitConfig={onConfigSubmit} />}
            {hasDeviceConnect && <DeviceConnection device={device} docsVersion={docsVersion} launchTerminal={launchTerminal} socketClosed={socketClosed} />}
            {waiting ? (
              <DeviceInventoryLoader docsVersion={docsVersion} unauthorized={unauthorized} />
            ) : (
              <DeviceInventory device={device} setSnackbar={setSnackbar} unauthorized={unauthorized} />
            )}
          </>
        )}
      </div>
      {showHelptips && status === DEVICE_STATES.pending ? <AuthButton highlightHelp={highlightHelp} /> : null}

      <AuthsetsDialog
        dialogToggle={shouldUpdate => toggleAuthsets(false, shouldUpdate)}
        decommission={onDecommissionDevice}
        device={device}
        id_attribute={id_attribute}
        id_value={id_value}
        limitMaxed={limitMaxed}
        open={showAuthsetsDialog}
      />

      <TerminalDialog
        open={terminal}
        onCancel={() => setTerminal(false)}
        onSocketClose={() => setTimeout(() => setSocketClosed(true), 5000)}
        deviceId={device.id}
      />
    </div>
  );
};

const actionCreators = { decommissionDevice, getReleases, setSnackbar };

const mapStateToProps = state => {
  const { hasDeviceConfig } = getTenantCapabilities(state);
  return {
    docsVersion: getDocsVersion(state),
    hasDeviceConnect: state.app.features.hasDeviceConnect,
    hasDeviceConfig,
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
