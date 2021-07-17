import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { FormControl, Input, InputLabel, TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import { onboardingSteps } from '../../../constants/onboardingConstants';
import { duplicateFilter, unionizeStrings } from '../../../helpers';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';

export const ReleaseTooltip = () => (
  <div style={{ fontSize: 12 }}>
    <p>
      If a Release with this name already exists, this new Artifact may be grouped into a Release with other Artifacts of the same name - so long as they are
      compatible with different device types
    </p>
    <Link to="/help/releases-artifacts" style={{ color: '#679ba5' }}>
      Learn more about releases
    </Link>
  </div>
);

export const ArtifactInformation = ({ customDeviceTypes, deviceTypes = [], name, onboardingState, selectedDeviceTypes = [], updateCreation }) => {
  const deviceTypeRef = useRef();
  const releaseNameRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });

  const handleResize = () => setTimeout(() => setSize({ height: window.innerHeight, width: window.innerWidth }), 500);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // to allow device types to automatically be selected on entered ',' we have to filter the input and transform any completed device types (followed by a ',')
  // while also checking for duplicates and allowing complete resets of the input
  const onTextInputChange = (value, reason) => {
    if (reason === 'clear') {
      return updateCreation({ customDeviceTypes: '', selectedDeviceTypes: [] });
    } else if (reason === 'reset' || !value || !selectedDeviceTypes.length) {
      return;
    }
    const lastIndex = value.lastIndexOf(',');
    const possibleCustomDeviceTypes = value.substring(0, lastIndex).split(',').filter(duplicateFilter);
    const customDeviceTypes = value.substring(lastIndex + 1);
    const possibleDeviceTypeSelection = unionizeStrings(selectedDeviceTypes, possibleCustomDeviceTypes);
    updateCreation({ customDeviceTypes, selectedDeviceTypes: possibleDeviceTypeSelection });
  };

  const onTextInputLeave = value => {
    const possibleDeviceTypeSelection = unionizeStrings(selectedDeviceTypes, [value]);
    updateCreation({ customDeviceTypes: '', selectedDeviceTypes: possibleDeviceTypeSelection });
  };

  let onboardingComponent = null;
  if (!onboardingState.complete && deviceTypeRef.current && releaseNameRef.current) {
    const deviceTypeAnchor = {
      left: deviceTypeRef.current.offsetLeft + deviceTypeRef.current.clientWidth,
      top: deviceTypeRef.current.offsetTop + deviceTypeRef.current.clientHeight / 2
    };
    const releaseNameAnchor = {
      left: releaseNameRef.current.parentElement.parentElement.offsetLeft + releaseNameRef.current.clientWidth,
      top: releaseNameRef.current.parentElement.parentElement.offsetTop + releaseNameRef.current.clientHeight / 2
    };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE, onboardingState, {
      anchor: deviceTypeAnchor,
      place: 'right'
    });
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME,
      onboardingState,
      { anchor: releaseNameAnchor, place: 'right' },
      onboardingComponent
    );
  }

  return (
    <div className="flexbox column" style={{ maxWidth: 400 }}>
      <h4>Artifact information</h4>
      <Autocomplete
        id="compatible-device-type-selection"
        value={selectedDeviceTypes}
        filterSelectedOptions
        freeSolo={true}
        includeInputInList={true}
        multiple
        // allow edits to the textinput without deleting existing device types by ignoring backspace
        onChange={(e, value) => (e.key !== 'Backspace' ? updateCreation({ selectedDeviceTypes: value }) : null)}
        onInputChange={(e, v, reason) => onTextInputChange(null, reason)}
        options={deviceTypes}
        renderInput={params => (
          <TextField
            className="device-types-input"
            {...params}
            fullWidth
            inputProps={{
              ...params.inputProps,
              value: customDeviceTypes
            }}
            key="device-types"
            label="Device types compatible"
            onBlur={e => onTextInputLeave(e.target.value)}
            onChange={e => onTextInputChange(e.target.value, 'input')}
            placeholder="Enter all device types this software is compatible with"
            ref={deviceTypeRef}
          />
        )}
      />
      <FormControl>
        <InputLabel htmlFor="release-name" style={{ alignItems: 'center', display: 'flex' }}>
          Release name
          <Tooltip key="release-name-tip" title={<ReleaseTooltip />} placement="bottom" arrow={true} interactive leaveDelay={300}>
            <InfoIcon fontSize="small" classes={{ root: 'margin-left-small' }} />
          </Tooltip>
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
      {!!onboardingComponent && onboardingComponent}
    </div>
  );
};

export default ArtifactInformation;
