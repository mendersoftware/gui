import React, { useEffect, useState } from 'react';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useDebounce } from '../../utils/debouncehook';

export const AsyncAutocomplete = ({
  id,
  initialValue = '',
  label,
  placeholder,
  styles,
  selectionAttribute,
  labelAttribute,
  onChange,
  onChangeSelection,
  options
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const loading = open && options.length === 0;

  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    const selection = options.find(option => option[selectionAttribute] === debouncedValue);
    if (selection) {
      onChangeSelection(selection);
    } else {
      onChange(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    const selection = options.find(option => option[selectionAttribute] === debouncedValue);
    if (selection) {
      onChangeSelection(selection);
    }
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
      getOptionSelected={(option, value) => option[selectionAttribute] === value[selectionAttribute]}
      id={id}
      inputValue={inputValue}
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
                {loading && <CircularProgress color="inherit" />}
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
