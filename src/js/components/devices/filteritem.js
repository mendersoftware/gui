import React from 'react';

// material ui
import { IconButton, MenuItem, Select, TextField, FormHelperText } from '@material-ui/core';
import { HighlightOff as HighlightOffIcon } from '@material-ui/icons';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';

import { DEVICE_FILTERING_OPTIONS } from '../../constants/deviceConstants';
import Loader from '../common/loader';

import { emptyFilter, getFilterLabelByKey } from './filters';
import { filtersCompare } from '../../helpers';

const filter = createFilterOptions();

const textFieldStyle = { marginTop: 0, marginBottom: 15 };

const filterOptionsByPlan = {
  os: { $eq: { title: 'equals' } },
  professional: DEVICE_FILTERING_OPTIONS,
  enterprise: DEVICE_FILTERING_OPTIONS
};

const operatorHelpMessages = {
  $gt: 'The "greater than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.',
  $gte: 'The "greater than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.',
  $lt: 'The "lesser than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.',
  $lte: 'The "lesser than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.',
  $in: 'The "in" operator accepts a list of comma-separated values. It matches if the selected field is equal to one of the specified values.',
  $nin: 'The "not in" operator accepts a list of comma-separated values. It matches if the selected field\'s value is not equal to any of the specified options.',
  $exists: 'The "exists" operator matches if the selected field\'s value has a value.'
};

const defaultScope = 'inventory';

export default class FilterItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      key: props.filter.key, // this refers to the selected filter with key as the id
      value: props.filter.value, // while this is the value that is applied with the filter
      operator: props.filter.operator || '$eq',
      scope: props.filter.scope || defaultScope,
      reset: true
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (Math.abs(prevProps.filters.length - this.props.filters.length) > 1) {
      this.setState(emptyFilter);
    }
    if (this.props.filter.key && this.props.filter.key !== this.state.key) {
      this.setState(this.props.filter);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = filtersCompare([this.state], [nextState]);
    if (shouldUpdate) {
      return true;
    }
    if (nextProps.filters.length !== this.props.filters.length) {
      return true;
    }
    if (nextProps.loading !== this.props.loading) {
      return true;
    }
    return !(nextState.key === this.state.key && nextState.value === this.state.value && nextState.operator === this.state.operator);
  }

  updateFilterKey(value) {
    const self = this;
    if (!value) {
      return self._removeFilter();
    }
    const { key, scope } = self.props.filters.find(filter => filter.key === value);
    self.setState({ key, scope }, () => self.notifyFilterUpdate());
  }

  updateFilterOperator(value) {
    const self = this;
    self.setState({ operator: value }, () => self.notifyFilterUpdate());
  }

  updateFilterValue(value) {
    const self = this;
    self.setState({ value }, () => self.notifyFilterUpdate());
  }

  notifyFilterUpdate() {
    const self = this;
    clearTimeout(self.timer);
    self.timer = setTimeout(
      () =>
        self.state.key
          ? self.props.onSelect({
              key: self.state.key,
              operator: self.state.operator,
              scope: self.state.scope,
              value: self.state.value
            })
          : null,
      700
    );
  }

  _removeFilter() {
    this.props.onRemove(this.state);
    this.setState({ ...emptyFilter, reset: !this.state.reset });
  }

  render() {
    const self = this;
    const { attributes, filters, loading, plan } = self.props;
    const { key, operator, reset, value } = self.state;
    const filterOptions = plan ? filterOptionsByPlan[plan] : DEVICE_FILTERING_OPTIONS;
    const operatorHelpMessage = operatorHelpMessages[operator] || '';
    return (
      <>
        <div className="flexbox" style={{ alignItems: 'center' }}>
          <Autocomplete
            autoComplete
            autoHighlight
            autoSelect
            freeSolo
            filterSelectedOptions
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
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
            groupBy={option => option.category}
            getOptionLabel={option => option.value || option.key || option}
            id="filter-selection"
            includeInputInList={true}
            onChange={(e, changedValue) => {
              if (changedValue && changedValue.inputValue) {
                // only circumvent updateFilterKey if we deal with a custom attribute - those will be treated as inventory attributes
                return self.setState({ key: changedValue.inputValue, scope: defaultScope }, () => self.notifyFilterUpdate());
              }
              self.updateFilterKey(changedValue && changedValue.key ? changedValue.key : changedValue);
            }}
            options={filters.sort((a, b) => a.priority - b.priority)}
            renderInput={params => <TextField {...params} label="Attribute" style={textFieldStyle} />}
            key={reset}
            value={getFilterLabelByKey(key, attributes)}
          />
          <Select className="margin-left-small margin-right-small" onChange={event => self.updateFilterOperator(event.target.value)} value={operator}>
            {Object.entries(filterOptions).map(([optionKey, option]) => (
              <MenuItem key={optionKey} value={optionKey}>
                {option.title}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Value"
            value={value}
            onChange={e => self.updateFilterValue(e.target.value)}
            InputLabelProps={{ shrink: !!value }}
            style={textFieldStyle}
          />
          {!!key && (
            <IconButton className="margin-left" onClick={() => self._removeFilter()} size="small">
              <HighlightOffIcon />
            </IconButton>
          )}
          <Loader show={loading} />
        </div>
        {operatorHelpMessage && (
          <div className="margin-bottom-small">
            <FormHelperText>
              {operatorHelpMessage}
            </FormHelperText>
          </div>
        )}
      </>
    );
  }
}
