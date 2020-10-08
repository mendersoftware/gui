import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { Help as HelpIcon } from '@material-ui/icons';

import raspberryPi from '../../../../assets/img/raspberrypi.png';
import raspberryPi4 from '../../../../assets/img/raspberrypi4.jpg';

import { getReleases } from '../../../actions/releaseActions';
import { getUserOrganization } from '../../../actions/organizationActions';

import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';
import { advanceOnboarding } from '../../../utils/onboardingmanager';

export class DeviceConnectionDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      onDevice: false,
      progress: 1,
      virtualDevice: false
    };
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (self.props.open && self.props.open !== prevProps.open) {
      if (self.props.isEnterprise) {
        self.props.getUserOrganization();
      }
      self.props.getReleases();
    }
  }

  onBackClick() {
    const self = this;
    let state = { progress: self.state.progress - 1 };
    if (!state.progress) {
      state = { onDevice: false, progress: 1, virtualDevice: false };
    }
    self.setState(state);
  }

  render() {
    const self = this;
    const { onboardingDeviceType, open, onboardingComplete, onCancel, pendingCount } = self.props;
    const { progress, onDevice, virtualDevice } = self.state;

    let content = (
      <div>
        <div>
          During the guided evaluation we will walk you through installing Mender on a device and deploying:
          <ul>
            <li>
              a simple <i>application</i> update
            </li>
            <li>
              a full <i>system</i> update
            </li>
            <li>
              a <i>Docker container</i> update
            </li>
          </ul>
          The evaluation of hosted Mender is optimized for Raspberry Pi 3 & 4 running Raspberry Pi OS. If you have such a device at hand you can proceed to
          prepare and connect your device.
          <div>
            <div
              id="deb-package-help"
              className="tooltip help"
              data-tip
              data-for="deb-package-tip"
              data-event="click focus"
              style={{ top: '30%', left: '85%' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="deb-package-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <p>
                The Mender .deb package should work on most operating systems in the debian family (e.g. Debian, Ubuntu, Raspberry Pi OS) and devices based on
                ARMv6 or newer (e.g. Raspberry Pi 2/3/4, Beaglebone).
              </p>
              <p>
                Otherwise, use the virtual device or read more about <a href="https://hub.mender.io">Board integrations</a>
              </p>
            </ReactTooltip>
          </div>
          <div className="flexbox centered column os-list">
            <div>
              {[raspberryPi, raspberryPi4].map((tile, index) => (
                <img key={`tile-${index}`} src={tile} />
              ))}
            </div>
            <Button variant="contained" onClick={() => self.setState({ onDevice: true })}>
              Prepare and connect my Raspberry Pi
            </Button>
          </div>
        </div>
        <div className="flexbox centered column">
          If you don&apos;t have your own device you can use a Docker-run virtual device to try out Mender.
          <div>
            <img src="assets/img/docker.png" style={{ height: '40px', verticalAlign: 'middle' }} />
            <a onClick={() => self.setState({ virtualDevice: true })}>Prepare a virtual device for now</a>
          </div>
        </div>
      </div>
    );

    if (onDevice) {
      content = <PhysicalDeviceOnboarding progress={progress} />;
    } else if (virtualDevice) {
      content = <VirtualDeviceOnboarding />;
    }

    if (pendingCount && !onboardingComplete) {
      setTimeout(() => onCancel(), 2000);
    }
    if (open && progress >= 2 && pendingCount && !window.location.hash.includes('pending')) {
      advanceOnboarding('dashboard-onboarding-start');
      return <Redirect to="/devices/pending" />;
    }

    return (
      <Dialog open={open || false} fullWidth={true} maxWidth="sm">
        <DialogTitle>Connecting a device</DialogTitle>
        <DialogContent className="onboard-dialog dialog-content">{content}</DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <div style={{ flexGrow: 1 }} />
          {(onDevice || virtualDevice) && (
            <div>
              <Button onClick={() => self.onBackClick()}>Back</Button>
              {progress < 2 ? (
                <Button
                  variant="contained"
                  disabled={!(virtualDevice || (onDevice && onboardingDeviceType))}
                  onClick={() => self.setState({ progress: progress + 1 })}
                >
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
  }
}

const actionCreators = { getReleases, getUserOrganization };

const mapStateToProps = state => {
  return {
    isEnterprise: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    pendingCount: state.devices.byStatus.pending.total,
    onboardingComplete: state.users.onboarding.complete,
    onboardingDeviceType: state.users.onboarding.deviceType,
    token: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
