// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import docker from '../../../../assets/img/docker.png';
import raspberryPi4 from '../../../../assets/img/raspberrypi4.png';
import raspberryPi from '../../../../assets/img/raspberrypi.png';
import { setDeviceListState } from '../../../actions/deviceActions';
import { advanceOnboarding } from '../../../actions/onboardingActions';
import { TIMEOUTS } from '../../../constants/appConstants';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDocsVersion, getTenantCapabilities } from '../../../selectors';
import InfoText from '../../common/infotext';
import { DeviceSupportTip } from '../../helptips/helptooltips';
import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

const useStyles = makeStyles()(theme => ({
  rpiQuickstart: {
    backgroundColor: theme.palette.background.lightgrey
  },
  virtualLogo: { height: 40, marginLeft: theme.spacing(2) }
}));

const DeviceConnectionExplainer = ({ docsVersion, hasMonitor, setOnDevice, setVirtualDevice }) => {
  const { classes } = useStyles();
  return (
    <>
      <p>
        You can connect almost any device and Linux OS with Mender, but to make things simple during evaluation we recommend you use a Raspberry Pi as a test
        device.
      </p>
      <div className={`padding-small padding-top-none rpi-quickstart ${classes.rpiQuickstart}`}>
        <h3>Raspberry Pi quick start</h3>
        <p>We&apos;ll walk you through the steps to connect a Raspberry Pi and deploy your first update with Mender.</p>
        <div className="flexbox column centered">
          <div className="flexbox centered os-list">
            {[raspberryPi, raspberryPi4].map((tile, index) => (
              <img key={`tile-${index}`} src={tile} />
            ))}
          </div>
          <Button variant="contained" color="secondary" onClick={() => setOnDevice(true)}>
            Get Started
          </Button>
        </div>
      </div>
      <div className="two-columns margin-top">
        <div className="padding-small padding-top-none">
          <div className="flexbox center-aligned">
            <h3>Use a virtual device</h3>
            <img src={docker} className={classes.virtualLogo} />
          </div>
          <p className="margin-top-none">Don&apos;t have a Raspberry Pi?</p>
          <p>You can use our Docker-run virtual device to go through the same tutorial.</p>
          {hasMonitor && (
            <InfoText className="slightly-smaller">
              If you want to evaluate our commercial components such as mender-monitor, please use a physical device instead as the virtual client does not
              support these components at this time.
            </InfoText>
          )}
          <a onClick={() => setVirtualDevice(true)}>Try a virtual device</a>
        </div>
        <div className="padding-small padding-top-none">
          <h3>Other devices</h3>
          <div>See the documentation to integrate the following with Mender:</div>
          <ul>
            {[
              { key: 'debian', target: `https://docs.mender.io/${docsVersion}operating-system-updates-debian-family`, title: 'Debian family' },
              { key: 'yocto', target: `https://docs.mender.io/${docsVersion}operating-system-updates-yocto-project`, title: 'Yocto OSes' }
            ].map(item => (
              <li key={item.key}>
                <a href={item.target} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          Or visit{' '}
          <a href="https://hub.mender.io/c/board-integrations" target="_blank" rel="noopener noreferrer">
            Mender Hub
          </a>{' '}
          and search integrations for your device and OS.
        </div>
      </div>
      <DeviceSupportTip />
    </>
  );
};

export const DeviceConnectionDialog = ({
  advanceOnboarding,
  docsVersion,
  hasMonitor,
  onboardingDeviceType,
  onboardingComplete,
  onCancel,
  pendingCount,
  setDeviceListState
}) => {
  const [onDevice, setOnDevice] = useState(false);
  const [progress, setProgress] = useState(1);
  const [virtualDevice, setVirtualDevice] = useState(false);
  const [pendingDevicesCount] = useState(pendingCount);
  const [hasMoreDevices, setHasMoreDevices] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasMoreDevices(pendingCount > pendingDevicesCount);
  }, [pendingDevicesCount, pendingCount]);

  useEffect(() => {
    if ((virtualDevice || progress >= 2) && hasMoreDevices && !window.location.hash.includes('pending')) {
      advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START);
      setDeviceListState({ state: DEVICE_STATES.pending });
      navigate('/devices/pending');
    }
  }, [advanceOnboarding, hasMoreDevices, progress, virtualDevice]);

  const onBackClick = () => {
    let updatedProgress = progress - 1;
    if (!updatedProgress) {
      updatedProgress = 1;
      setOnDevice(false);
      setVirtualDevice(false);
    }
    setProgress(updatedProgress);
  };

  const onAdvance = () => {
    advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START);
    setProgress(progress + 1);
  };

  let content = <DeviceConnectionExplainer docsVersion={docsVersion} hasMonitor={hasMonitor} setOnDevice={setOnDevice} setVirtualDevice={setVirtualDevice} />;
  if (onDevice) {
    content = <PhysicalDeviceOnboarding progress={progress} />;
  } else if (virtualDevice) {
    content = <VirtualDeviceOnboarding />;
  }

  if (hasMoreDevices && !onboardingComplete) {
    setTimeout(onCancel, TIMEOUTS.twoSeconds);
  }

  return (
    <Dialog open={true} PaperProps={{ sx: { maxWidth: '720px' } }}>
      <DialogTitle>Connecting a device</DialogTitle>
      <DialogContent className="onboard-dialog" style={{ margin: '0 30px' }}>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        {(onDevice || virtualDevice) && (
          <div>
            <Button onClick={onBackClick}>Back</Button>
            {progress < 2 && (!virtualDevice || progress < 1) ? (
              <Button variant="contained" disabled={!(virtualDevice || (onDevice && onboardingDeviceType))} onClick={onAdvance}>
                Next
              </Button>
            ) : (
              <Button variant="contained" disabled={!onboardingComplete} onClick={onCancel}>
                {onboardingComplete ? 'Close' : 'Waiting for device'}
              </Button>
            )}
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { advanceOnboarding, setDeviceListState };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    hasMonitor: getTenantCapabilities(state).hasMonitor,
    pendingCount: state.devices.byStatus.pending.total,
    onboardingComplete: state.onboarding.complete,
    onboardingDeviceType: state.onboarding.deviceType
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
