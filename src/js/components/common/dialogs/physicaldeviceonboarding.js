import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import HelpIcon from '@material-ui/icons/Help';

import CopyCode from '../copy-code';
import AutoSelect from '../forms/autoselect';
import { setOnboardingApproach, setOnboardingDeviceType } from '../../../actions/userActions';
import { findLocalIpAddress } from '../../../actions/appActions';
import { getDebConfigurationCode } from '../../../helpers';
import { advanceOnboarding } from '../../../utils/onboardingmanager';

export class PhysicalDeviceOnboarding extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selection: null
    };
  }

  componentDidMount() {
    const self = this;
    if (!self.props.ipAddress || self.props.ipAddress === 'X.X.X.X') {
      self.props.findLocalIpAddress();
    }
    self.props.setOnboardingApproach('physical');
  }

  onSelect(deviceType) {
    this.props.setOnboardingDeviceType(deviceType);
    this.setState({ selection: deviceType });
  }

  render() {
    const self = this;
    const { selection } = self.state;
    const { ipAddress, isHosted, isEnterprise, token, debPackageVersion } = self.props;

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
          <CopyCode code={codeToCopy} onCopy={() => advanceOnboarding('dashboard-onboarding-start')} withDescription={true} />
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

const actionCreators = { findLocalIpAddress, setOnboardingApproach, setOnboardingDeviceType };

const mapStateToProps = state => {
  return {
    ipAddress: state.app.hostAddress,
    isEnterprise: state.app.features.isEnterprise,
    isHosted: state.app.features.isHosted,
    debPackageVersion: state.app.menderDebPackageVersion,
    token: state.users.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(PhysicalDeviceOnboarding);
