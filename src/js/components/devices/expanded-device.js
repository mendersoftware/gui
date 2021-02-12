import React, { useState } from 'react';
import { connect } from 'react-redux';

import { setSnackbar } from '../../actions/appActions';
import { decommissionDevice, setDeviceConfig } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
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
  defaultConfig,
  device,
  docsVersion,
  getDeviceConfig,
  hasDeviceConfig,
  hasDeviceConnect,
  highlightHelp,
  id_attribute,
  id_value,
  limitMaxed,
  refreshDevices,
  saveGlobalSettings,
  setDeviceConfig,
  setSnackbar,
  showHelptips,
  unauthorized
}) => {
  const { attributes, status = DEVICE_STATES.accepted } = device;

  const [showAuthsetsDialog, setShowAuthsetsDialog] = useState(false);
  const [socketClosed, setSocketClosed] = useState(true);
  const [terminal, setTerminal] = useState(false);

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

  const onConfigSubmit = ({ config, isDefault }) => {
    let tasks = [setDeviceConfig(device.id, config)];
    if (isDefault) {
      tasks.push(saveGlobalSettings({ defaultDeviceConfig: config }));
    }
    return Promise.all(tasks).then(() => getDeviceConfig(device.id));
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
        {hasDeviceConfig && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status) && (
          <DeviceConfiguration device={device} defaultConfig={defaultConfig} submitConfig={onConfigSubmit} />
        )}
        {status === DEVICE_STATES.accepted && (
          <>
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

const actionCreators = { decommissionDevice, saveGlobalSettings, setDeviceConfig, setSnackbar };

const mapStateToProps = state => {
  const { hasDeviceConfig } = getTenantCapabilities(state);
  return {
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    docsVersion: getDocsVersion(state),
    hasDeviceConnect: state.app.features.hasDeviceConnect,
    hasDeviceConfig,
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
