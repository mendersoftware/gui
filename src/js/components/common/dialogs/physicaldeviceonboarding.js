import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import HelpIcon from '@material-ui/icons/Help';

import CopyCode from '../copy-code';
import { advanceOnboarding, setOnboardingApproach, setOnboardingDeviceType } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDebConfigurationCode, versionCompare } from '../../../helpers';
import { getDocsVersion, getIsEnterprise, getOnboardingState } from '../../../selectors';

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

export const DeviceTypeSelectionStep = ({ docsVersion, hasConvertedImage, onboardingState, onSelect, selection = '' }) => {
  const shouldShowOnboardingTip = !onboardingState.complete && onboardingState.showTips && onboardingState.showHelptips;
  return (
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
          onChange={onSelect}
          renderInput={params => (
            <TextField {...params} label="Device type" placeholder="Choose a device type" InputProps={{ ...params.InputProps }} style={{ marginTop: 0 }} />
          )}
          value={selection}
        />
      </div>
      {shouldShowOnboardingTip && (
        <>
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
        </>
      )}
      {hasConvertedImage && (
        <div className="margin-top">
          <p>
            We prepared an image, ready for Mender, for you to start with. You can find it in the{' '}
            <a href={`https://docs.mender.io/${docsVersion}get-started/preparation/prepare-a-raspberry-pi-device`} target="_blank" rel="noopener noreferrer">
              Prepare a Raspberry Pi device
            </a>{' '}
            documentation, which also contains instructions for initial device setup.Once you&apos;re done flashing you can go ahead and proceed to the next
            step.
          </p>
        </div>
      )}
    </div>
  );
};

export const InstallationStep = ({ advanceOnboarding, ipAddress, isHosted, isEnterprise, tenantToken, selection, isPreRelease }) => {
  const codeToCopy = getDebConfigurationCode(ipAddress, isHosted, isEnterprise, tenantToken, selection, isPreRelease);
  return (
    <div>
      <b>2. Log into your device and install the Mender client</b>
      <p>
        Copy & paste and run this command <b>on your device</b>:
      </p>
      <CopyCode code={codeToCopy} onCopy={() => advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START)} withDescription={true} />
      <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
      <p>
        Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can continue.
      </p>
    </div>
  );
};

const steps = {
  1: DeviceTypeSelectionStep,
  2: InstallationStep
};

export const PhysicalDeviceOnboarding = ({
  advanceOnboarding,
  docsVersion,
  ipAddress,
  isHosted,
  isEnterprise,
  isPreRelease,
  onboardingState,
  progress,
  setOnboardingApproach,
  setOnboardingDeviceType,
  tenantToken
}) => {
  const [selection, setSelection] = useState('');

  useEffect(() => {
    setOnboardingApproach('physical');
  }, []);

  const onSelect = (e, deviceType, reason) => {
    if (reason === 'select-option') {
      setOnboardingDeviceType(deviceType.value);
      setSelection(deviceType.value);
    }
  };

  const hasConvertedImage = !!selection && selection.length && (selection.startsWith('raspberrypi3') || selection.startsWith('raspberrypi4'));

  const ComponentToShow = steps[progress];
  return (
    <ComponentToShow
      advanceOnboarding={advanceOnboarding}
      docsVersion={docsVersion}
      hasConvertedImage={hasConvertedImage}
      ipAddress={ipAddress}
      isEnterprise={isEnterprise}
      isHosted={isHosted}
      isPreRelease={isPreRelease}
      onboardingState={onboardingState}
      onSelect={onSelect}
      selection={selection}
      tenantToken={tenantToken}
    />
  );
};

const actionCreators = { advanceOnboarding, setOnboardingApproach, setOnboardingDeviceType };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    ipAddress: state.app.hostAddress,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    isPreRelease: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    onboardingState: getOnboardingState(state),
    tenantToken: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(PhysicalDeviceOnboarding);
