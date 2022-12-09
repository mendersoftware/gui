import React, { useEffect, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { TIMEOUTS } from '../../constants/appConstants';
import { useDebounce } from '../../utils/debouncehook';
import Loader from './loader';

export const AsyncAutocomplete = ({
  id,
  initialValue,
  isLoading,
  label,
  placeholder,
  styles,
  selectionAttribute,
  labelAttribute,
  onChange,
  onChangeSelection,
  options
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const loading = open && isLoading;

  const debouncedValue = useDebounce(inputValue, TIMEOUTS.debounceShort);

  useEffect(() => {
    if (debouncedValue === undefined) {
      return;
    }
    const selection = options.find(option => option[selectionAttribute] === debouncedValue);
    if (selection) {
      onChangeSelection(selection);
    } else {
      onChange(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    const selection = options.find(option => option[selectionAttribute] === debouncedValue);
    onChangeSelection(selection);
  }, [options]);

  const onInputChange = (e, value, reason) => {
    if (reason === 'clear') {
      setInputValue('');
      return onChangeSelection();
    } else if ((reason === 'reset' && !e) || reason === 'blur') {
      return;
    }
    setInputValue(value);
  };

  return (
    <Autocomplete
      autoHighlight
      freeSolo
      getOptionLabel={option => option[labelAttribute]}
      isOptionEqualToValue={(option, value) => option[selectionAttribute] === value[selectionAttribute]}
      id={id}
      inputValue={inputValue || ''}
      loading={loading}
      onClose={() => setOpen(false)}
      onInputChange={onInputChange}
      onOpen={() => setOpen(true)}
      open={open}
      openOnFocus
      options={options}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          style={styles.textField}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <Loader show small table style={{ marginTop: theme.spacing(-4) }} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default AsyncAutocomplete;
