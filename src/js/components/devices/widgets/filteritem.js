// Copyright 2019 Northern.tech AS
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
import React, { useCallback, useEffect, useState } from 'react';

import { Help as HelpIcon, HighlightOff as HighlightOffIcon } from '@mui/icons-material';
// material ui
import { FormHelperText, IconButton, MenuItem, Select, TextField } from '@mui/material';

import { TIMEOUTS } from '../../../constants/appConstants';
import { DEVICE_FILTERING_OPTIONS, emptyFilter } from '../../../constants/deviceConstants';
import MenderTooltip from '../../common/mendertooltip';
import AttributeAutoComplete from './attribute-autocomplete';

const textFieldStyle = { marginTop: 0, marginBottom: 15 };

let timer;
const filterOptionsByPlan = {
  os: { $eq: { title: 'equals' } },
  professional: DEVICE_FILTERING_OPTIONS,
  enterprise: DEVICE_FILTERING_OPTIONS
};

const defaultScope = 'inventory';

const filterNotifications = {
  name: (
    <MenderTooltip arrow placement="bottom" title="Filtering by name is limited to devices with a previously defined name.">
      <div className="tooltip help" style={{ top: 20, left: -12 }}>
        <HelpIcon />
      </div>
    </MenderTooltip>
  )
};

export const FilterItem = ({ attributes, filter, onRemove, onSelect, plan }) => {
  const [key, setKey] = useState(filter.key || ''); // this refers to the selected filter with key as the id
  const [value, setValue] = useState(filter.value || ''); // while this is the value that is applied with the filter
  const [operator, setOperator] = useState(filter.operator || '$eq');
  const [scope, setScope] = useState(filter.scope || defaultScope);
  const [reset, setReset] = useState(true);

  useEffect(() => {
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setKey(emptyFilter.key);
    setValue(emptyFilter.value);
    setOperator(emptyFilter.operator);
    setScope(emptyFilter.scope);
  }, [attributes.length, reset]);

  useEffect(() => {
    setKey(filter.key);
    setValue(filter.value);
    setOperator(filter.operator);
    setScope(filter.scope);
  }, [filter.key]);

  useEffect(() => {
    clearTimeout(timer);
    timer = setTimeout(
      () =>
        key && (value || operator.includes('exists'))
          ? onSelect({
              key,
              operator,
              scope,
              value
            })
          : null,
      TIMEOUTS.debounceDefault
    );
  }, [key, operator, scope, value]);

  const updateFilterKey = ({ key, scope }) => {
    setKey(key);
    setScope(scope);
  };

  const updateFilterOperator = ({ target: { value: changedOperator } }) => {
    const operator = DEVICE_FILTERING_OPTIONS[changedOperator] || {};
    const opValue = operator.value ?? value ?? '';
    setOperator(changedOperator);
    setValue(opValue);
  };

  const updateFilterValue = ({ target: { value = '' } }) => {
    setValue(value);
  };

  const removeFilter = useCallback(() => {
    onRemove({ key, operator, scope, value });
    setReset(!reset);
  }, [key, onRemove, operator, reset, scope, setReset, value]);

  const filterOptions = plan ? filterOptionsByPlan[plan] : DEVICE_FILTERING_OPTIONS;
  const operatorHelpMessage = (DEVICE_FILTERING_OPTIONS[operator] || {}).help || '';
  const showValue = typeof (filterOptions[operator] || {}).value === 'undefined';
  return (
    <>
      <div className="flexbox center-aligned relative">
        {filterNotifications[key]}
        <AttributeAutoComplete attributes={attributes} filter={filter} label="Attribute" onRemove={removeFilter} onSelect={updateFilterKey} />
        <Select className="margin-left-small margin-right-small" onChange={updateFilterOperator} value={operator}>
          {Object.entries(filterOptions).map(([optionKey, option]) => (
            <MenuItem key={optionKey} value={optionKey}>
              {option.title}
            </MenuItem>
          ))}
        </Select>
        {showValue && <TextField label="Value" value={value} onChange={updateFilterValue} InputLabelProps={{ shrink: !!value }} style={textFieldStyle} />}
        {!!key && (
          <IconButton className="margin-left" onClick={removeFilter} size="small">
            <HighlightOffIcon />
          </IconButton>
        )}
      </div>
      {operatorHelpMessage && (
        <div className="margin-bottom-small">
          <FormHelperText>{operatorHelpMessage}</FormHelperText>
        </div>
      )}
    </>
  );
};

export default FilterItem;
