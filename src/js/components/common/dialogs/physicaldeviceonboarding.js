import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import HelpIcon from '@material-ui/icons/Help';

import CopyCode from '../copy-code';
import { advanceOnboarding, setOnboardingApproach, setOnboardingDeviceType } from '../../../actions/onboardingActions';
import { changeIntegration } from '../../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getDebConfigurationCode, versionCompare } from '../../../helpers';
import { getDocsVersion, getIsEnterprise, getOnboardingState } from '../../../selectors';
import menderTheme from '../../../themes/mender-theme';
import { MenderTooltipClickable } from '../mendertooltip';

const filter = createFilterOptions();

const types = [
  { title: 'Raspberry Pi 3', value: 'raspberrypi3' },
  { title: 'Raspberry Pi 4', value: 'raspberrypi4' }
];

export const ConvertedImageNote = ({ docsVersion }) => (
  <p>
    We prepared an image, ready for Mender, for you to start with. You can find it in the{' '}
    <a href={`https://docs.mender.io/${docsVersion}get-started/preparation/prepare-a-raspberry-pi-device`} target="_blank" rel="noopener noreferrer">
      Prepare a Raspberry Pi device
    </a>{' '}
    documentation, which also contains instructions for initial device setup.Once you&apos;re done flashing you can go ahead and proceed to the next step.
  </p>
);

export const ExternalProviderConnector = ({ connectionString, setConnectionString }) => {
  const [checked, setChecked] = useState(!!connectionString);
  return (
    <>
      <h4 className="margin-top-large">Integrate with other services</h4>
      <FormControlLabel
        control={<Checkbox id="azure-link" name="azure-link" onChange={(e, checked) => setChecked(checked)} color="primary" checked={checked} />}
        label="Link a Microsoft Azure IoT Hub account"
        style={{ marginTop: 0 }}
      />
      {checked && (
        <>
          <TextField
            label="Azure IoT Hub connection string"
            onChange={({ target: { value } }) => setConnectionString(value)}
            style={{ marginTop: 0, maxWidth: 300 }}
            value={connectionString}
          />
          <span className="info">
            Devices accepted in Mender will be automatically created in Azure IoT Hub, and will send application and telemetry data there.
          </span>
        </>
      )}
    </>
  );
};

export const DeviceTypeSelectionStep = ({
  docsVersion,
  hasConvertedImage,
  onboardingState,
  onSelect,
  providerConnectionString,
  selection = '',
  setConnectionString,
  version
}) => {
  const shouldShowOnboardingTip = !onboardingState.complete && onboardingState.showTips && onboardingState.showHelptips;
  const hasExternalIntegrationSupport = versionCompare(version, '3.2') > -1;
  return (
    <>
      <h4>Enter your device type</h4>
      <p>Setting this attribute on the device ensures that the device will only receive updates for compatible software releases.</p>

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
        style={{ maxWidth: 300 }}
        value={selection}
      />
      {shouldShowOnboardingTip && (
        <MenderTooltipClickable
          placement="bottom"
          style={{ marginTop: menderTheme.spacing(-3) }}
          title={
            <div>
              <p>
                If you don&apos;t see your exact device on the list, choose <i>Generic ARMv6 or newer</i> to continue the tutorial for now.
              </p>
              <p>
                (Note: if your device is <i>not</i> based on ARMv6 or newer, the tutorial won&apos;t work - instead, go back and use the virtual device)
              </p>
            </div>
          }
        >
          <div className="tooltip help">
            <HelpIcon />
          </div>
        </MenderTooltipClickable>
      )}
      {hasConvertedImage && <ConvertedImageNote docsVersion={docsVersion} />}
      {hasExternalIntegrationSupport && <ExternalProviderConnector connectionString={providerConnectionString} setConnectionString={setConnectionString} />}
    </>
  );
};

export const InstallationStep = ({ advanceOnboarding, selection, ...remainingProps }) => {
  const codeToCopy = getDebConfigurationCode({ ...remainingProps, deviceType: selection });
  return (
    <>
      <h4>Log into your device and install the Mender client</h4>
      <p>
        Copy & paste and run this command <b>on your device</b>:
      </p>
      <CopyCode code={codeToCopy} onCopy={() => advanceOnboarding(onboardingSteps.DASHBOARD_ONBOARDING_START)} withDescription={true} />
      <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
      <p>
        Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can continue.
      </p>
    </>
  );
};

const steps = {
  1: DeviceTypeSelectionStep,
  2: InstallationStep
};

export const PhysicalDeviceOnboarding = ({
  advanceOnboarding,
  azureConnectionString,
  changeIntegration,
  docsVersion,
  ipAddress,
  isHosted,
  isEnterprise,
  isDemoMode,
  isPreRelease,
  onboardingState,
  progress,
  setOnboardingApproach,
  setOnboardingDeviceType,
  tenantToken,
  version
}) => {
  const [selection, setSelection] = useState('');
  const [connectionString, setConnectionString] = useState(azureConnectionString);

  useEffect(() => {
    setOnboardingApproach('physical');
  }, []);

  useEffect(() => {
    const hasExternalIntegrationSupport = versionCompare(version, '3.2') > -1;
    if (hasExternalIntegrationSupport && progress > 1 && !!connectionString && connectionString !== azureConnectionString) {
      changeIntegration({ ...EXTERNAL_PROVIDER.azure, connectionString });
    }
  }, [progress]);

  const onSelect = (e, deviceType, reason) => {
    if (reason === 'select-option') {
      setOnboardingDeviceType(deviceType.value);
      setSelection(deviceType.value);
    } else if (reason === 'clear') {
      setOnboardingDeviceType('');
      setSelection('');
    }
  };

  const hasConvertedImage = !!selection && selection.length && (selection.startsWith('raspberrypi3') || selection.startsWith('raspberrypi4'));

  const ComponentToShow = steps[progress];
  return (
    <ComponentToShow
      advanceOnboarding={advanceOnboarding}
      providerConnectionString={connectionString}
      docsVersion={docsVersion}
      hasConvertedImage={hasConvertedImage}
      ipAddress={ipAddress}
      isEnterprise={isEnterprise}
      isHosted={isHosted}
      isDemoMode={isDemoMode}
      isPreRelease={isPreRelease}
      onboardingState={onboardingState}
      onSelect={onSelect}
      setConnectionString={setConnectionString}
      selection={selection}
      tenantToken={tenantToken}
      version={version}
    />
  );
};

const actionCreators = { advanceOnboarding, changeIntegration, setOnboardingApproach, setOnboardingDeviceType };

const mapStateToProps = state => {
  const { connectionString: azureConnectionString = '' } =
    state.organization.externalDeviceIntegrations.find(integration => integration.provider === EXTERNAL_PROVIDER.azure.provider) ?? {};
  return {
    azureConnectionString,
    docsVersion: getDocsVersion(state),
    ipAddress: state.app.hostAddress,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    isDemoMode: state.app.features.isDemoMode,
    isPreRelease: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    onboardingState: getOnboardingState(state),
    tenantToken: state.organization.organization.tenant_token,
    version: state.app.versionInformation.Integration
  };
};

export default connect(mapStateToProps, actionCreators)(PhysicalDeviceOnboarding);
