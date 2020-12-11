import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { Help as HelpIcon } from '@material-ui/icons';

import docker from '../../../../assets/img/docker.png';
import raspberryPi from '../../../../assets/img/raspberrypi.png';
import raspberryPi4 from '../../../../assets/img/raspberrypi4.jpg';

import { advanceOnboarding } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDocsVersion } from '../../../selectors';

import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

export const DeviceConnectionDialog = ({ advanceOnboarding, docsVersion, onboardingDeviceType, onboardingComplete, onCancel, pendingCount }) => {
  const [onDevice, setOnDevice] = useState(false);
  const [progress, setProgress] = useState(1);
  const [virtualDevice, setVirtualDevice] = useState(false);

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

  let content = (
    <div>
      <div>
        <p>
          You can connect almost any device and Linux OS with Mender, but to make things simple during evaluation we recommend you use a Raspberry Pi as a test
          device.
        </p>
        <h3>Get started quickly with a Raspberry Pi</h3>
        <p>We&apos;ll walk you through the steps to connect a Raspberry Pi and deploy your first update.</p>
        <div>
          <div id="deb-package-help" className="tooltip help" data-tip data-for="deb-package-tip" data-event="click focus" style={{ top: '22%', left: '88%' }}>
            <HelpIcon />
          </div>
          <ReactTooltip id="deb-package-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
            <p>
              The steps in the guide should work on most operating systems in the debian family (e.g. Debian, Ubuntu, Raspberry Pi OS) and devices based on
              ARMv6 or newer (e.g. Raspberry Pi 2/3/4, Beaglebone).
            </p>
          </ReactTooltip>
        </div>
        <div className="flexbox centered column os-list">
          <div>
            {[raspberryPi, raspberryPi4].map((tile, index) => (
              <img key={`tile-${index}`} src={tile} />
            ))}
          </div>
          <Button variant="contained" onClick={() => setOnDevice(true)}>
            Prepare and connect my Raspberry Pi
          </Button>
        </div>
      </div>
      <div className="flexbox centered column">
        <span>
          <b>Don&apos;t have a Raspberry Pi?</b> You can use our Docker-run virtual device to go through the same tutorial.
        </span>
        <div>
          <img src={docker} style={{ height: '40px', verticalAlign: 'middle', marginRight: '8px' }} />
          <a onClick={() => setVirtualDevice(true)}>Prepare a virtual device for now</a>
        </div>
      </div>

      <div>
        <h3>Connecting other devices</h3>
        <p>For other devices, we provide documentation to integrate with Mender.</p>
        <ul>
          <li>
            Learn how to integrate devices with{' '}
            <a href={`https://docs.mender.io/${docsVersion}system-updates-debian-family`} target="_blank" rel="noopener noreferrer">
              Debian family
            </a>{' '}
            or{' '}
            <a href={`https://docs.mender.io/${docsVersion}system-updates-yocto-project`} target="_blank" rel="noopener noreferrer">
              Yocto OSes
            </a>
          </li>
          <li>
            Or visit{' '}
            <a href={`https://hub.mender.io/c/board-integrations`} target="_blank" rel="noopener noreferrer">
              Board Integrations
            </a>{' '}
            on Mender Hub and search for your device and OS.
          </li>
        </ul>
      </div>
    </div>
  );

  if (onDevice) {
    content = <PhysicalDeviceOnboarding progress={progress} />;
  } else if (virtualDevice) {
    content = <VirtualDeviceOnboarding />;
  }

  if (pendingCount && !onboardingComplete) {
    setTimeout(onCancel, 2000);
  }
  if (progress >= 2 && pendingCount && !window.location.hash.includes('pending')) {
    advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START);
    return <Redirect to="/devices/pending" />;
  }

  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
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
            {progress < 2 ? (
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

const actionCreators = { advanceOnboarding };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    pendingCount: state.devices.byStatus.pending.total,
    onboardingComplete: state.onboarding.complete,
    onboardingDeviceType: state.onboarding.deviceType
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
