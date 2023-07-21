// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { FormControl, Input, InputLabel, TextField } from '@mui/material';

import { TIMEOUTS } from '../../../constants/appConstants';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { useDebounce } from '../../../utils/debouncehook';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';
import useWindowSize from '../../../utils/resizehook';
import ChipSelect from '../../common/chipselect';
import { DOCSTIPS, DocsTooltip } from '../../common/docslink';
import { InfoHintContainer } from '../../common/info-hint';
import { HELPTOOLTIPS, MenderHelpTooltip } from '../../helptips/helptooltips';
import { FileInformation } from './addartifact';

const defaultVersion = '1.0.0';

export const VersionInformation = ({ creation = {}, onRemove, updateCreation }) => {
  const { file, fileSystem: propFs, name, softwareName: propName, softwareVersion: version = '', type } = creation;
  const [fileSystem, setFileSystem] = useState(propFs);
  const [softwareName, setSoftwareName] = useState(propName || name.replace('.', '-'));
  const [softwareVersion, setSoftwareVersion] = useState(version || defaultVersion);

  useEffect(() => {
    updateCreation({ finalStep: true });
  }, [updateCreation]);

  useEffect(() => {
    updateCreation({ fileSystem, softwareName, softwareVersion, isValid: fileSystem && softwareName && softwareVersion });
  }, [fileSystem, softwareName, softwareVersion, updateCreation]);

  return (
    <>
      <FileInformation file={file} type={type} onRemove={onRemove} />
      <h4>Version information</h4>
      <div className="flexbox column">
        {[
          { key: 'fileSystem', title: 'Software filesystem', setter: setFileSystem, value: fileSystem },
          { key: 'softwareName', title: 'Software name', setter: setSoftwareName, value: softwareName },
          { key: 'softwareVersion', title: 'Software version', setter: setSoftwareVersion, value: softwareVersion }
        ].map(({ key, title, setter, value: currentValue }, index) => (
          <TextField autoFocus={!index} fullWidth key={key} label={title} onChange={({ target: { value } }) => setter(value)} value={currentValue} />
        ))}
      </div>
    </>
  );
};

const checkDestinationValidity = destination => (destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : true);

export const ArtifactInformation = ({ advanceOnboarding, creation = {}, deviceTypes = [], onboardingState, onRemove, updateCreation }) => {
  const { destination = '', file, name = '', selectedDeviceTypes = [], type } = creation;
  const deviceTypeRef = useRef();
  const releaseNameRef = useRef();
  const destinationRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const debouncedName = useDebounce(name, TIMEOUTS.debounceDefault);

  useEffect(() => {
    const nextDestination = onboardingState.complete ? destination : '/data/www/localhost/htdocs';
    updateCreation({
      destination: nextDestination,
      isValid: checkDestinationValidity(nextDestination) && selectedDeviceTypes.length && name,
      finalStep: false
    });
  }, [destination, name, onboardingState.complete, selectedDeviceTypes.length, updateCreation]);

  useEffect(() => {
    if (debouncedName.length) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME);
    }
  }, [advanceOnboarding, debouncedName]);

  const onSelectionChanged = useCallback(
    ({ currentValue = '', selection = [] }) => {
      if (currentValue.length > 3) {
        advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE);
      }
      updateCreation({
        customDeviceTypes: currentValue,
        isValid: (currentValue.length || selection.length) && name && destination,
        selectedDeviceTypes: selection
      });
    },
    [advanceOnboarding, destination, name, updateCreation]
  );

  const onDestinationChange = ({ target: { value } }) =>
    updateCreation({ destination: value, isValid: checkDestinationValidity(value) && selectedDeviceTypes.length && name });

  let onboardingComponent = null;
  let extraOnboardingComponent = null;
  if (!onboardingState.complete && deviceTypeRef.current && releaseNameRef.current) {
    const deviceTypeAnchor = {
      left: deviceTypeRef.current.parentElement.parentElement.offsetLeft + deviceTypeRef.current.parentElement.parentElement.clientWidth,
      top:
        deviceTypeRef.current.parentElement.parentElement.offsetTop +
        deviceTypeRef.current.parentElement.offsetTop +
        deviceTypeRef.current.parentElement.parentElement.clientHeight / 2
    };
    const releaseNameAnchor = {
      left: releaseNameRef.current.parentElement.parentElement.offsetLeft + releaseNameRef.current.parentElement.parentElement.clientWidth,
      top:
        releaseNameRef.current.parentElement.parentElement.offsetTop + releaseNameRef.current.parentElement.offsetTop + releaseNameRef.current.clientHeight / 2
    };
    const destinationAnchor = {
      left: destinationRef.current.parentElement.parentElement.offsetLeft + destinationRef.current.parentElement.parentElement.clientWidth,
      top: destinationRef.current.parentElement.parentElement.offsetTop + destinationRef.current.parentElement.parentElement.clientHeight / 2
    };
    extraOnboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION,
      onboardingState,
      { anchor: destinationAnchor, place: 'right' },
      extraOnboardingComponent
    );
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME,
      onboardingState,
      { anchor: releaseNameAnchor, place: 'right' },
      onboardingComponent
    );
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE,
      onboardingState,
      { anchor: deviceTypeAnchor, place: 'right' },
      onboardingComponent
    );
  }

  const isValidDestination = checkDestinationValidity(destination);
  return (
    <div className="flexbox column">
      <FileInformation file={file} type={type} onRemove={onRemove} />
      <TextField
        autoFocus={true}
        error={!isValidDestination}
        fullWidth
        helperText={!isValidDestination && <div className="warning">Destination has to be an absolute path</div>}
        inputProps={{ style: { marginTop: 16 } }}
        InputLabelProps={{ shrink: true }}
        label="Destination directory where the file will be installed on your devices"
        onChange={onDestinationChange}
        placeholder="Example: /opt/installed-by-single-file"
        inputRef={destinationRef}
        value={destination}
      />
      <h4>Artifact information</h4>
      <FormControl>
        <InputLabel htmlFor="release-name" style={{ alignItems: 'center', display: 'flex' }}>
          Release name
          <InfoHintContainer>
            <MenderHelpTooltip id={HELPTOOLTIPS.releaseName.id} />
            <DocsTooltip id={DOCSTIPS.releases.id} />
          </InfoHintContainer>
        </InputLabel>
        <Input
          defaultValue={name}
          className="release-name-input"
          id="release-name"
          placeholder="A descriptive name for the software"
          onChange={e => updateCreation({ name: e.target.value })}
          inputRef={releaseNameRef}
        />
      </FormControl>
      <ChipSelect
        id="compatible-device-type-selection"
        inputRef={deviceTypeRef}
        label="Device types compatible"
        onChange={onSelectionChanged}
        placeholder="Enter all device types this software is compatible with"
        selection={selectedDeviceTypes}
        options={deviceTypes}
      />
      {onboardingComponent}
      {extraOnboardingComponent}
    </div>
  );
};

const steps = [ArtifactInformation, VersionInformation];

export const ArtifactInformationForm = ({ activeStep, ...remainder }) => {
  const Component = steps[activeStep];
  return <Component {...remainder} />;
};

export default ArtifactInformationForm;
