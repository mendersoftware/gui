import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';

import CopyPasteIcon from '@material-ui/icons/FileCopy';
import HelpIcon from '@material-ui/icons/Help';

import AutoSelect from '../forms/autoselect';
import AppActions from '../../../actions/app-actions';
import { findLocalIpAddress, getDebConfigurationCode } from '../../../helpers';
import { advanceOnboarding } from '../../../utils/onboardingmanager';
import AppStore from '../../../stores/app-store';

export default class PhysicalDeviceOnboarding extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selection: null,
      ipAddress: AppStore.getHostAddress(),
      copied: false
    };
  }

  componentDidMount() {
    const self = this;
    if (!self.state.ipAddress || self.state.ipAddress === 'X.X.X.X') {
      findLocalIpAddress().then(ipAddress => self.setState({ ipAddress }));
    }
    AppActions.setOnboardingApproach('physical');
  }

  copied() {
    var self = this;
    self.setState({ copied: true });
    advanceOnboarding('dashboard-onboarding-start');
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }

  onSelect(deviceType) {
    AppActions.setOnboardingDeviceType(deviceType);
    this.setState({ selection: deviceType });
  }

  render() {
    const self = this;
    const { ipAddress, selection } = self.state;
    const { token } = self.props;
    const isHosted = AppStore.getIsHosted();
    const isEnterprise = AppStore.getIsEnterprise();
    const debPackageVersion = AppStore.getMenderDebPackageVersion();

    const codeToCopy = getDebConfigurationCode(ipAddress, isHosted, isEnterprise, token, debPackageVersion, selection);

    const types = [
      {
        title: 'BeagleBone',
        value: 'beaglebone'
      },
      {
        title: 'Raspberry Pi 3',
        value: 'raspberrypi3'
      },
      {
        title: 'Raspberry Pi 4',
        value: 'raspberrypi4'
      },
      {
        title: 'Generic ARMv6 or newer',
        value: 'generic-armv6'
      }
    ];

    const steps = {
      1: (
        <div className="flexbox column">
          <b>1. Enter your device type</b>
          <p>Setting this attribute on the device ensures that the device will only receive updates for compatible software releases.</p>
          <div className="flexbox centered">
            <AutoSelect label="Device type" errorText="Choose a device type" items={types} onChange={item => self.onSelect(item)} />
          </div>
          <div id="onboard-connect-1" className="tooltip help" data-tip data-for="physical-device-type-tip" data-event="click focus">
            <HelpIcon />
          </div>
          <ReactTooltip
            id="physical-device-type-tip"
            globalEventOff="click"
            place="bottom"
            type="light"
            effect="solid"
            className="react-tooltip"
            style={{ maxWidth: 300 }}
          >
            <div>
              <p>
                If you don&apos;t see your exact device on the list, choose <i>Generic ARMv6 or newer</i> to continue the tutorial for now.
              </p>
              <p>
                (Note: if your device is <i>not</i> based on ARMv6 or newer, the tutorial won&apos;t work - instead, go back and use the virtual device)
              </p>
            </div>
          </ReactTooltip>
        </div>
      ),
      2: (
        <div>
          <b>2. SSH into your device and install the Mender client</b>
          <p>
            Copy & paste and run this command <b>on your device</b>:
          </p>
          <div className="code">
            <CopyToClipboard text={codeToCopy} onCopy={() => self.copied(true)}>
              <Button style={{ float: 'right', margin: '-10px 0 0 10px' }}>
                <CopyPasteIcon />
                Copy to clipboard
              </Button>
            </CopyToClipboard>
            <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{codeToCopy}</span>
          </div>
          <p>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
          <p>
            Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can
            continue.
          </p>
        </div>
      )
    };
    return <div>{steps[self.props.progress]}</div>;
  }
}
