// Copyright 2023 Northern.tech AS
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
import React, { useEffect, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { TIMEOUTS } from '../../constants/appConstants';
import { duplicateFilter, unionizeStrings } from '../../helpers';
import { useDebounce } from '../../utils/debouncehook';

export const ChipSelect = ({
  className = '',
  id = 'chip-select',
  selection = [],
  disabled = false,
  inputRef,
  label = '',
  onChange,
  options = [],
  placeholder = ''
}) => {
  const [value, setValue] = useState('');
  const [currentSelection, setCurrentSelection] = useState(selection);

  const debouncedValue = useDebounce(value, TIMEOUTS.debounceDefault);

  useEffect(() => {
    onChange({ currentValue: debouncedValue, selection: currentSelection });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, JSON.stringify(currentSelection), onChange]);

  // to allow device types to automatically be selected on entered ',' we have to filter the input and transform any completed device types (followed by a ',')
  // while also checking for duplicates and allowing complete resets of the input
  const onTextInputChange = (inputValue, reason) => {
    const value = inputValue || '';
    if (reason === 'clear') {
      setValue('');
      return setCurrentSelection([]);
    } else if (reason === 'reset') {
      return setValue('');
    }
    const lastIndex = value.lastIndexOf(',');
    const possibleSelection = value.substring(0, lastIndex).split(',').filter(duplicateFilter);
    const currentValue = value.substring(lastIndex + 1);
    const nextSelection = unionizeStrings(currentSelection, possibleSelection);
    setValue(currentValue);
    setCurrentSelection(nextSelection);
  };

  const onTextInputLeave = value => {
    const nextSelection = unionizeStrings(currentSelection, [value]);
    setValue('');
    setCurrentSelection(nextSelection);
  };

  return (
    <Autocomplete
      id={id}
      value={currentSelection}
      className={className}
      filterSelectedOptions
      freeSolo={true}
      includeInputInList={true}
      multiple
      // allow edits to the textinput without deleting existing device types by ignoring backspace
      onChange={(e, value) => (e.key !== 'Backspace' ? setCurrentSelection(value) : null)}
      onInputChange={(e, v, reason) => onTextInputChange(null, reason)}
      options={options}
      readOnly={disabled}
      renderInput={params => (
        <TextField
          {...params}
          fullWidth
          inputProps={{ ...params.inputProps, value }}
          InputProps={{ ...params.InputProps, disableUnderline: disabled }}
          key={`${id}-input`}
          label={label}
          onBlur={e => onTextInputLeave(e.target.value)}
          onChange={e => onTextInputChange(e.target.value, 'input')}
          placeholder={currentSelection.length ? '' : placeholder}
          inputRef={inputRef}
        />
      )}
    />
  );
};

export default ChipSelect;
