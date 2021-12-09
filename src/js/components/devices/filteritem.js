import React, { useEffect, useState } from 'react';

// material ui
import { IconButton, MenuItem, Select, TextField, FormHelperText } from '@material-ui/core';
import { Help as HelpIcon, HighlightOff as HighlightOffIcon } from '@material-ui/icons';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';

import { DEVICE_FILTERING_OPTIONS } from '../../constants/deviceConstants';

import { emptyFilter, getFilterLabelByKey } from './filters';
import MenderTooltip from '../common/mendertooltip';
import theme from '../../themes/mender-theme';

const optionsFilter = createFilterOptions();

const textFieldStyle = { marginTop: 0, marginBottom: 15 };

let timer;
const filterOptionsByPlan = {
  os: { $eq: { title: 'equals' } },
  professional: DEVICE_FILTERING_OPTIONS,
  enterprise: DEVICE_FILTERING_OPTIONS
};

const defaultScope = 'inventory';

const filterNotificationLocation = { top: theme.spacing(2.5), left: theme.spacing(-1.5) };
const filterNotifications = {
  name: (
    <MenderTooltip arrow placement="bottom" title="Filtering by name is limited to devices with a previously defined name.">
      <div className="tooltip help" style={filterNotificationLocation}>
        <HelpIcon />
      </div>
    </MenderTooltip>
  )
};

const getOptionLabel = option => option.value || option.key || option;

const FilterOption = option => {
  const content = getOptionLabel(option);
  if (option.category !== 'recently used') {
    return content;
  }
  return (
    <div className="flexbox center-aligned space-between" style={{ width: '100%' }}>
      <div>{content}</div>
      <div className="text-muted slightly-smaller">({option.scope})</div>
    </div>
  );
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
      700
    );
  }, [key, operator, scope, value]);

  const updateFilterKey = (value, selectedScope) => {
    if (!value) {
      return removeFilter();
    }
    const { key, scope: fallbackScope } = attributes.find(filter => filter.key === value);
    setKey(key);
    setScope(selectedScope || fallbackScope);
  };

  const updateFilterOperator = ({ target: { value: changedOperator } }) => {
    const operator = DEVICE_FILTERING_OPTIONS[changedOperator] || {};
    const opValue = operator.value ?? operator.value ?? value ?? '';
    setOperator(changedOperator);
    setValue(opValue);
  };

  const updateFilterValue = ({ target: { value = '' } }) => {
    setValue(value);
  };

  const removeFilter = () => {
    onRemove({
      key,
      operator,
      scope,
      value
    });
    setReset(!reset);
  };

  const filterOptions = plan ? filterOptionsByPlan[plan] : DEVICE_FILTERING_OPTIONS;
  const operatorHelpMessage = (DEVICE_FILTERING_OPTIONS[operator] || {}).help || '';
  const showValue = typeof (filterOptions[operator] || {}).value === 'undefined';
  return (
    <>
      <div className="flexbox center-aligned relative">
        {filterNotifications[key]}
        <Autocomplete
          autoComplete
          autoHighlight
          autoSelect
          freeSolo
          filterSelectedOptions
          filterOptions={(options, params) => {
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
          }}
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
          options={attributes.sort((a, b) => a.priority - b.priority)}
          renderInput={params => <TextField {...params} label="Attribute" style={textFieldStyle} />}
          key={reset}
          value={getFilterLabelByKey(key, attributes)}
        />
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
