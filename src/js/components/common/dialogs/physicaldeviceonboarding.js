import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Help as HelpIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { Autocomplete, TextField } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';

import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import { getDebConfigurationCode, versionCompare } from '../../../helpers';
import { getDocsVersion, getIsEnterprise } from '../../../selectors';
import CopyCode from '../copy-code';
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
    documentation, which also contains instructions for initial device setup. Once you&apos;re done flashing you can go ahead and proceed to the next step.
  </p>
);

const IntegrationsLink = () => (
  <Link to="/settings/integrations" target="_blank">
    Integration settings
  </Link>
);

export const ExternalProviderTip = ({ hasExternalIntegration, integrationProvider }) => (
  <MenderTooltipClickable
    className="clickable flexbox muted"
    placement="bottom"
    style={{ alignItems: 'end', marginBottom: 3 }}
    title={
      <div style={{ maxWidth: 350 }}>
        {hasExternalIntegration ? (
          <p>
            Devices added here will be automatically integrated with the <i>{EXTERNAL_PROVIDER[integrationProvider].title}</i> you set in the{' '}
            <IntegrationsLink />.
          </p>
        ) : (
          <p>
            To connect your devices with <i>{EXTERNAL_PROVIDER[integrationProvider].title}</i>, go to <IntegrationsLink /> and set up the integration.
          </p>
        )}
      </div>
    }
  >
    <InfoIcon />
  </MenderTooltipClickable>
);

export const DeviceTypeTip = () => (
  <MenderTooltipClickable
    className="flexbox"
    placement="bottom"
    style={{ alignItems: 'end' }}
    title={
      <>
        <p>
          If you don&apos;t see your exact device on the list, choose <i>Generic ARMv6 or newer</i> to continue the tutorial for now.
        </p>
        <p>
          (Note: if your device is <i>not</i> based on ARMv6 or newer, the tutorial won&apos;t work - instead, go back and use the virtual device)
        </p>
      </>
    }
  >
    <div className="tooltip help" style={{ marginLeft: 0, position: 'initial' }}>
      <HelpIcon />
    </div>
  </MenderTooltipClickable>
);

export const DeviceTypeSelectionStep = ({ docsVersion, hasConvertedImage, hasExternalIntegration, integrationProvider, onSelect, selection = '', version }) => {
  const hasExternalIntegrationSupport = versionCompare(version, '3.2') > -1;
  return (
    <>
      <h4>Enter your device type</h4>
      <p>Setting this attribute on the device ensures that the device will only receive updates for compatible software releases.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'max-content 50px 150px', justifyItems: 'center' }}>
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
        {hasExternalIntegrationSupport && <ExternalProviderTip hasExternalIntegration={hasExternalIntegration} integrationProvider={integrationProvider} />}
      </div>
      {hasConvertedImage && <ConvertedImageNote docsVersion={docsVersion} />}
    </>
  );
};

export const InstallationStep = ({ selection, ...remainingProps }) => {
  const codeToCopy = getDebConfigurationCode({ ...remainingProps, deviceType: selection, isOnboarding: false });
  return (
    <>
      <h4>Log into your device and install the Mender client</h4>
      <p>
        Copy & paste and run this command <b>on your device</b>:
      </p>
      <CopyCode code={codeToCopy} withDescription={true} />
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
  docsVersion,
  hasExternalIntegration,
  integrationProvider,
  ipAddress,
  isHosted,
  isEnterprise,
  isDemoMode,
  isPreRelease,
  tenantToken,
  version
}) => {
  const [selection, setSelection] = useState('');
  const [progress, setProgress] = useState(1);

  const onSelect = (e, deviceType, reason) => {
    if (reason === 'selectOption') {
      setSelection(deviceType.value);
      setProgress(2);
    } else if (reason === 'clear') {
      setSelection('');
    }
  };

  const hasConvertedImage = !!selection && selection.length && (selection.startsWith('raspberrypi3') || selection.startsWith('raspberrypi4'));

  const ComponentToShow = steps[progress];
  return (
    <ComponentToShow
      hasExternalIntegration={hasExternalIntegration}
      docsVersion={docsVersion}
      hasConvertedImage={hasConvertedImage}
      integrationProvider={integrationProvider}
      ipAddress={ipAddress}
      isEnterprise={isEnterprise}
      isHosted={isHosted}
      isDemoMode={isDemoMode}
      isPreRelease={isPreRelease}
      onSelect={onSelect}
      selection={selection}
      tenantToken={tenantToken}
      version={version}
    />
  );
};

const mapStateToProps = state => {
  const integrationProvider = EXTERNAL_PROVIDER['iot-hub'].provider;
  const { credentials = {} } = state.organization.externalDeviceIntegrations.find(integration => integration.provider === integrationProvider) ?? {};
  const { [EXTERNAL_PROVIDER['iot-hub'].credentialsAttribute]: azureConnectionString = '' } = credentials;
  return {
    docsVersion: getDocsVersion(state),
    hasExternalIntegration: azureConnectionString,
    integrationProvider,
    ipAddress: state.app.hostAddress,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    isDemoMode: state.app.features.isDemoMode,
    isPreRelease: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    tenantToken: state.organization.organization.tenant_token,
    version: state.app.versionInformation.Integration
  };
};

export default connect(mapStateToProps)(PhysicalDeviceOnboarding);
