import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import HelpIcon from '@material-ui/icons/Help';

import CopyCode from '../copy-code';
import { advanceOnboarding, setOnboardingApproach, setOnboardingDeviceType } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDebConfigurationCode } from '../../../helpers';
import { getDocsVersion, getIsEnterprise } from '../../../selectors';

const filter = createFilterOptions();

const types = [
  {
    title: 'Raspberry Pi 3',
    value: 'raspberrypi3'
  },
  {
    title: 'Raspberry Pi 4',
    value: 'raspberrypi4'
  }
];

export class PhysicalDeviceOnboarding extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selection: { title: '', value: '' }
    };
  }

  componentDidMount() {
    this.props.setOnboardingApproach('physical');
  }

  onSelect(deviceType, reason) {
    if (reason === 'select-option') {
      this.props.setOnboardingDeviceType(deviceType.value);
      this.setState({ selection: deviceType.value });
    }
  }

  render() {
    const self = this;
    const { selection } = self.state;
    const { advanceOnboarding, debPackageVersion, docsVersion, ipAddress, isHosted, isEnterprise, progress, token } = self.props;

    const codeToCopy = getDebConfigurationCode(ipAddress, isHosted, isEnterprise, token, debPackageVersion, selection);
    const hasConvertedImage = !!selection && selection.length && (selection.startsWith('raspberrypi3') || selection.startsWith('raspberrypi4'));
    const steps = {
      1: (
        <div className="flexbox column">
          <b>1. Enter your device type</b>
          <p>Setting this attribute on the device ensures that the device will only receive updates for compatible software releases.</p>
          <div className="flexbox centered">
            <Autocomplete
              id="device-type-selection"
              autoSelect
              autoHighlight
              filterSelectedOptions
              freeSolo
              getOptionLabel={option => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                  return option;
                }
                if (option.key === 'custom' && option.value === selection) {
                  return option.value;
                }
                return option.title;
              }}
              handleHomeEndKeys
              includeInputInList
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (filtered.length !== 1 && params.inputValue !== '') {
                  filtered.push({
                    value: params.inputValue,
                    key: 'custom',
                    title: `Use "${params.inputValue}"`
                  });
                }
                return filtered;
              }}
              options={types}
              onChange={(e, item, reason) => self.onSelect(item, reason)}
              renderInput={params => (
                <TextField {...params} label="Device type" placeholder="Choose a device type" InputProps={{ ...params.InputProps }} style={{ marginTop: 0 }} />
              )}
              value={selection}
            />
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
          {hasConvertedImage && (
            <div className="margin-top">
              <p>
                We prepared an image, fully integrated with Mender for you to start with. You can find it in the{' '}
                <a
                  href={`https://docs.mender.io/${docsVersion}get-started/preparation/prepare-a-raspberry-pi-device`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Prepare a Raspberry Pi device
                </a>{' '}
                documentation, which also contains instructions for initial device setup. Once you&apos;re done flashing you can go ahead and proceed to the
                next step.
              </p>
            </div>
          )}
        </div>
      ),
      2: (
        <div>
          <b>2. Log into your device and install the Mender client</b>
          <p>
            Copy & paste and run this command <b>on your device</b>:
          </p>
          <CopyCode code={codeToCopy} onCopy={() => advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START)} withDescription={true} />
          <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
          <p>
            Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can
            continue.
          </p>
        </div>
      )
    };
    return <div>{steps[progress]}</div>;
  }
}

const actionCreators = { advanceOnboarding, setOnboardingApproach, setOnboardingDeviceType };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    ipAddress: state.app.hostAddress,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    debPackageVersion: state.app.menderDebPackageVersion,
    token: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(PhysicalDeviceOnboarding);
