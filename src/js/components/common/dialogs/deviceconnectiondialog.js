import React from 'react';
import { Redirect } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import HelpIcon from '@material-ui/icons/Help';

import AppActions from '../../../actions/app-actions';

import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';
import AppStore from '../../../stores/app-store';
import { advanceOnboarding } from '../../../utils/onboardingmanager';

export default class DeviceConnectionDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      onDevice: false,
      progress: 1,
      token: null,
      virtualDevice: false
    };
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (self.props.open && self.props.open !== prevProps.open) {
      if (AppStore.hasMultitenancy() || AppStore.getIsEnterprise() || AppStore.getIsHosted()) {
        AppActions.getUserOrganization().then(org => (org ? self.setState({ token: org.tenant_token }) : null));
      }
      AppActions.getReleases().then(releases => AppActions.setOnboardingArtifactIncluded(!!releases.length));
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
    const { open, onCancel } = self.props;
    const { progress, onDevice, token, virtualDevice } = self.state;

    let content = (
      <div>
        <div>
          If you have your own device at hand, you can follow the steps to connect it right away.
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
                The Mender .deb package should work on most operating systems in the debian family (e.g. Debian, Ubuntu, Raspbian) and devices based on ARMv6 or
                newer (e.g. Raspberry Pi 2/3, Beaglebone).
              </p>
              <p>
                Otherwise, use the virtual device or read more about <a href="https://hub.mender.io">Board integrations</a>
              </p>
            </ReactTooltip>
          </div>
          <p>The steps are optimized for Linux workstations and devices running an OS in the Debian family such as Raspbian, Ubuntu and Debian.</p>
          <div className="flexbox centered column os-list">
            <div>
              {['assets/img/debian.png', 'assets/img/ubuntu.png', 'assets/img/raspbian.webp'].map((tile, index) => (
                <img key={`tile-${index}`} src={tile} />
              ))}
            </div>
            <Button variant="contained" onClick={() => self.setState({ onDevice: true })}>
              Connect my own device!
            </Button>
          </div>
        </div>
        <div className="flexbox centered column">
          If you don&apos;t have your own device you can use a Docker-run virtual device to try out Mender.
          <div>
            <img src="assets/img/docker.png" style={{ height: '40px', verticalAlign: 'middle' }} />
            <a onClick={() => self.setState({ virtualDevice: true })}>I don&apos;t have my own device - use a virtual device for now</a>
          </div>
        </div>
      </div>
    );

    if (onDevice) {
      content = <PhysicalDeviceOnboarding progress={progress} token={token} />;
    } else if (virtualDevice) {
      content = <VirtualDeviceOnboarding token={token} />;
    }

    if (open && progress >= 2 && AppStore.getTotalPendingDevices() && !window.location.hash.includes('pending')) {
      advanceOnboarding('dashboard-onboarding-start');
      setTimeout(() => onCancel(), 2000);
      return <Redirect to="/devices/pending" />;
    }

    return (
      <Dialog open={open || false} fullWidth={true} maxWidth="sm">
        <DialogTitle>Connecting a device</DialogTitle>
        <DialogContent className="onboard-dialog">{content}</DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <div style={{ flexGrow: 1 }} />
          {onDevice || virtualDevice ? (
            <div>
              <Button onClick={() => self.onBackClick()}>Back</Button>
              {progress < 2 ? (
                <Button
                  variant="contained"
                  disabled={!(virtualDevice || (onDevice && AppStore.getOnboardingDeviceType()))}
                  onClick={() => self.setState({ progress: progress + 1 })}
                >
                  Next
                </Button>
              ) : (
                <Button variant="contained" disabled={true}>
                  Waiting for device
                </Button>
              )}
            </div>
          ) : null}
        </DialogActions>
      </Dialog>
    );
  }
}
