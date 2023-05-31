// Copyright 2022 Northern.tech AS
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

// material ui
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';

import { TIMEOUTS } from '../../../constants/appConstants';
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
    timer.current = setTimeout(() => onSelect({ key, scope }), TIMEOUTS.debounceDefault);
  }, [key, scope]);

  const updateFilterKey = (value, selectedScope) => {
    if (!value) {
      return removeFilter();
    }
    const { key = value, scope: fallbackScope } = attributes.find(filter => filter.key === value) ?? {};
    setKey(key);
    setScope(selectedScope || fallbackScope);
  };

  const removeFilter = useCallback(() => {
    if (key) {
      onRemove({ key, scope });
    }
    setReset(!reset);
  }, [key, onRemove, reset, setReset, scope]);

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
