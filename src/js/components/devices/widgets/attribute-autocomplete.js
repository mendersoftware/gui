import React, { useEffect, useRef, useState } from 'react';

// material ui
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';

import { getFilterLabelByKey } from './filters';

const textFieldStyle = { marginTop: 0, marginBottom: 15 };

const defaultScope = 'inventory';

const getOptionLabel = option => option.value || option.key || option;

const FilterOption = (props, option) => {
  let content = getOptionLabel(option);
  if (option.category === 'recently used') {
    content = (
      <div className="flexbox center-aligned space-between" style={{ width: '100%' }}>
        <div>{content}</div>
        <div className="muted slightly-smaller">({option.scope})</div>
      </div>
    );
  }
  return <li {...props}>{content}</li>;
};

const optionsFilter = createFilterOptions();

const filterOptions = (options, params) => {
  const filtered = optionsFilter(options, params);
  if (filtered.length !== 1 && params.inputValue !== '') {
    filtered.push({
      inputValue: params.inputValue,
      key: 'custom',
      value: `Use "${params.inputValue}"`,
      category: 'custom',
      priority: 99
    });
  }
  return filtered;
};

const defaultFilter = { key: '', scope: defaultScope };

export const AttributeAutoComplete = ({ attributes, disabled, filter = defaultFilter, label = 'Attribute', onRemove, onSelect }) => {
  const [key, setKey] = useState(filter.key); // this refers to the selected filter with key as the id
  const [options, setOptions] = useState([]);
  const [reset, setReset] = useState(true);
  const [scope, setScope] = useState(filter.scope);
  const timer = useRef();

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    setKey('');
    setScope(defaultScope);
    setOptions(attributes.sort((a, b) => a.priority - b.priority));
  }, [attributes.length, reset]);

  useEffect(() => {
    setKey(filter.key);
  }, [filter.key]);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSelect({ key, scope }), 700);
  }, [key, scope]);

  const updateFilterKey = (value, selectedScope) => {
    if (!value) {
      return removeFilter();
    }
    const { key = value, scope: fallbackScope } = attributes.find(filter => filter.key === value) ?? {};
    setKey(key);
    setScope(selectedScope || fallbackScope);
  };

  const removeFilter = () => {
    if (key) {
      onRemove({ key, scope });
    }
    setReset(!reset);
  };

  return (
    <Autocomplete
      autoComplete
      autoHighlight
      autoSelect
      disabled={disabled}
      freeSolo
      filterSelectedOptions
      filterOptions={filterOptions}
      getOptionLabel={getOptionLabel}
      groupBy={option => option.category}
      renderOption={FilterOption}
      id="filter-selection"
      includeInputInList={true}
      onChange={(e, changedValue) => {
        const { inputValue, key = changedValue, scope } = changedValue || {};
        if (inputValue) {
          // only circumvent updateFilterKey if we deal with a custom attribute - those will be treated as inventory attributes
          setKey(inputValue);
          return setScope(defaultScope);
        }
        updateFilterKey(key, scope);
      }}
      options={options}
      renderInput={params => <TextField {...params} label={label} style={textFieldStyle} />}
      key={reset}
      value={getFilterLabelByKey(key, attributes)}
    />
  );
};

export default AttributeAutoComplete;
