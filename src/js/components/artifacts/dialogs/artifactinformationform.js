import React from 'react';
import { Link } from 'react-router-dom';

import { FormControl, Input, InputLabel, TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';
import { duplicateFilter, unionizeStrings } from '../../../helpers';
import { advanceOnboarding, getOnboardingComponentFor, getOnboardingStepCompleted } from '../../../utils/onboardingmanager';

const ReleaseTooltip = () => (
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

export class ArtifactInformation extends React.Component {
  // to allow device types to automatically be selected on entered ',' we have to filter the input and transform any completed device types (followed by a ',')
  // while also checking for duplicates and allowing complete resets of the input
  onTextInputChange(updateCreation, value, selectedDeviceTypes, reason) {
    if (reason === 'clear') {
      return updateCreation({ customDeviceTypes: '', selectedDeviceTypes: [] });
    } else if (reason === 'reset' || (!value && !selectedDeviceTypes)) {
      return;
    }
    const lastIndex = value.lastIndexOf(',');
    const possibleCustomDeviceTypes = value
      .substring(0, lastIndex)
      .split(',')
      .filter(duplicateFilter);
    const customDeviceTypes = value.substring(lastIndex + 1);
    const possibleDeviceTypeSelection = unionizeStrings(selectedDeviceTypes, possibleCustomDeviceTypes);
    updateCreation({ customDeviceTypes, selectedDeviceTypes: possibleDeviceTypeSelection });
  }

  onTextInputLeave(updateCreation, value, selectedDeviceTypes) {
    const possibleDeviceTypeSelection = unionizeStrings(selectedDeviceTypes, [value]);
    updateCreation({ customDeviceTypes: '', selectedDeviceTypes: possibleDeviceTypeSelection });
  }

  onRefSet(refTarget, ref) {
    if ((!this[refTarget] && ref) || (this[refTarget] && ref && this[refTarget].className !== ref.className)) {
      this[refTarget] = ref;
      this.setState({});
    }
  }

  render() {
    const self = this;
    const { customDeviceTypes, deviceTypes, name, onboardingComplete, selectedDeviceTypes = [], updateCreation } = self.props;

    let onboardingComponent = null;
    if (!onboardingComplete && self.deviceTypeRef && self.releaseNameRef) {
      if ((selectedDeviceTypes.length || customDeviceTypes.length > 3) && !getOnboardingStepCompleted('upload-new-artifact-dialog-device-type')) {
        advanceOnboarding('upload-new-artifact-dialog-device-type');
      }
      const deviceTypeAnchor = {
        left: self.deviceTypeRef.offsetLeft + self.deviceTypeRef.clientWidth,
        top: self.deviceTypeRef.offsetTop + self.deviceTypeRef.clientHeight / 2
      };
      const releaseNameAnchor = {
        left: self.releaseNameRef.parentElement.parentElement.offsetLeft + self.releaseNameRef.clientWidth,
        top: self.releaseNameRef.parentElement.parentElement.offsetTop + self.releaseNameRef.clientHeight / 2
      };
      onboardingComponent = getOnboardingComponentFor('upload-new-artifact-dialog-device-type', { anchor: deviceTypeAnchor, place: 'right' });
      onboardingComponent = getOnboardingComponentFor(
        'upload-new-artifact-dialog-release-name',
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
          onInputChange={(e, v, reason) => self.onTextInputChange(updateCreation, null, null, reason)}
          options={deviceTypes}
          renderInput={params => (
            <TextField
              {...params}
              defaultValue={customDeviceTypes}
              fullWidth
              inputProps={{
                ...params.inputProps,
                value: customDeviceTypes
              }}
              key="device-types"
              label="Device types compatible"
              onBlur={e => self.onTextInputLeave(updateCreation, e.target.value, selectedDeviceTypes)}
              onChange={e => self.onTextInputChange(updateCreation, e.target.value, selectedDeviceTypes, 'input')}
              placeholder="Enter all device types this software is compatible with"
              ref={ref => self.onRefSet('deviceTypeRef', ref)}
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
            id="release-name"
            placeholder="A descriptive name for the software"
            onChange={e => updateCreation({ name: e.target.value })}
            inputRef={ref => self.onRefSet('releaseNameRef', ref)}
          />
        </FormControl>
        {!!onboardingComponent && onboardingComponent}
      </div>
    );
  }
}

export default ArtifactInformation;
