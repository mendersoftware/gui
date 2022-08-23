import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import validator from 'validator';

import { FormHelperText, TextField, Autocomplete } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';

import { fullyDecodeURI } from '../../../helpers';
import { UNGROUPED_GROUP } from '../../../constants/deviceConstants';
import InfoText from '../../common/infotext';

const filter = createFilterOptions();

export const validateGroupName = (encodedName, groups = [], selectedGroup, isCreationDynamic) => {
  const name = fullyDecodeURI(encodedName);
  let invalid = false;
  let errortext = null;
  const isModification = name.length && groups.some(group => decodeURIComponent(group) === name);
  if (!name && !isModification) {
    invalid = true;
  } else if (!validator.isWhitelisted(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
    invalid = true;
    errortext = 'Valid characters are a-z, A-Z, 0-9, _ and -';
  } else if (selectedGroup && name === selectedGroup) {
    invalid = true;
    errortext = `${name} is the same group the selected devices are already in`;
  } else if (isModification && isCreationDynamic) {
    invalid = true;
    errortext = 'A group with the same name already exists';
  } else if (name === UNGROUPED_GROUP.name) {
    invalid = true;
    errortext = `A group with the name ${name} is created automatically`;
  }
  return { errortext, invalid, isModification, name };
};

const GroupOption = (props, option) => <li {...props}>{option.title}</li>;

export const GroupDefinition = ({ isCreationDynamic, groups, newGroup, onInputChange, selectedGroup }) => {
  const [errortext, setErrorText] = useState('');

  const validateName = encodedName => {
    const { errortext: error, invalid, isModification, name } = validateGroupName(encodedName, groups, selectedGroup, isCreationDynamic);
    setErrorText(error);
    onInputChange(invalid, name, isModification);
  };

  const filteredGroups = groups
    .filter(group => group !== selectedGroup)
    .map(group => ({
      value: group,
      title: group
    }));
  return (
    <>
      <Autocomplete
        id="group-creation-selection"
        autoSelect
        freeSolo
        filterSelectedOptions
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          if (params.inputValue !== '' && (filtered.length !== 1 || (filtered.length === 1 && filtered[0].title !== params.inputValue))) {
            filtered.push({
              inputValue: params.inputValue,
              title: `Create "${params.inputValue}" group`
            });
          }
          return filtered;
        }}
        getOptionLabel={option => {
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.title;
        }}
        handleHomeEndKeys
        inputValue={newGroup}
        options={filteredGroups}
        onInputChange={(e, newValue) => validateName(newValue)}
        renderInput={params => <TextField {...params} label="Select a group, or type to create new" InputProps={{ ...params.InputProps }} />}
        renderOption={GroupOption}
      />
      <FormHelperText>{errortext}</FormHelperText>
      {isCreationDynamic && (
        <InfoText>
          Note: individual devices can&apos;t be added to dynamic groups.
          <br />
          <Link to="/help/devices">Learn more about static vs. dynamic groups</Link>
        </InfoText>
      )}
    </>
  );
};

export default GroupDefinition;
