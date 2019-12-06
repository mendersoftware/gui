import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import HelpIcon from '@material-ui/icons/Help';

import { getReleases } from '../../../actions/releaseActions';
import { getUserOrganization } from '../../../actions/userActions';

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
    const { onboardingDeviceType, open, onCancel, pendingCount } = self.props;
    const { progress, onDevice, virtualDevice } = self.state;

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
      content = <PhysicalDeviceOnboarding progress={progress} />;
    } else if (virtualDevice) {
      content = <VirtualDeviceOnboarding />;
    }

    if (pendingCount) {
      setTimeout(() => onCancel(), 2000);
    }
    if (open && progress >= 2 && pendingCount && !window.location.hash.includes('pending')) {
      advanceOnboarding('dashboard-onboarding-start');
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
                  disabled={!(virtualDevice || (onDevice && onboardingDeviceType))}
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

const actionCreators = { getReleases, getUserOrganization };

const mapStateToProps = state => {
  return {
    isEnterprise: state.app.features.hasMultitenancy || state.app.features.isEnterprise || state.app.features.isHosted,
    pendingCount: state.devices.byStatus.pending.total,
    onboardingDeviceType: state.users.onboarding.deviceType,
    token: state.users.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
