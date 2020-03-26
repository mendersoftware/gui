import React from 'react';

// material ui
import { IconButton, TextField } from '@material-ui/core';
import { HighlightOff as HighlightOffIcon } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';

import Loader from '../common/loader';

const textFieldStyle = { marginTop: 0, marginBottom: 15 };

export default class FilterItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      key: props.filter.key, // this refers to the selected filter with key as the id
      value: props.filter.value // while this is the value that is applied with the filter
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (Math.abs(prevProps.filters.length - this.props.filters.length) > 1) {
      this.setState({ key: undefined, value: undefined });
    }
    if (this.props.filter.key && this.props.filter.key !== this.state.key) {
      this.setState({ key: this.props.filter.key, value: this.props.filter.value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.filter.key && nextProps.filter.key !== this.state.key) {
      return true;
    }
    if (nextProps.filter.value && nextProps.filter.value !== this.state.value) {
      return true;
    }
    if (nextProps.filters.length !== this.props.filters.length) {
      return true;
    }
    if (nextProps.loading !== this.props.loading) {
      return true;
    }
    return !(nextState.key === this.state.key && nextState.value === this.state.value);
  }

  updateFilterKey(value) {
    const self = this;
    if (!value) {
      return self._removeFilter();
    }
    self.setState({ key: value }, () => (self.state.value ? self.props.onSelect(self.state) : null));
  }

  updateFilterValue(value) {
    const self = this;
    self.setState({ value }, () => self.notifyFilterUpdate());
  }

  notifyFilterUpdate() {
    const self = this;
    clearTimeout(self.timer);
    self.timer = setTimeout(() => (self.state.key && self.state.value ? self.props.onSelect(self.state) : null), 300);
  }

  _removeFilter() {
    this.setState({ key: undefined, value: undefined }, this.props.onRemove());
  }

  render() {
    const self = this;
    const { filterAttributes, filters, index, itemKey, loading } = self.props;
    const { key, value } = self.state;
    const selectedFilter = filterAttributes.find(filter => filter.key === key) || { key, value: key };
    return (
      <div className="flexbox" key={itemKey} style={{ alignItems: 'center' }}>
        <div className="margin-right">Device matching:</div>
        <Autocomplete
          autoComplete
          id={`filter-selection-${index}`}
          freeSolo
          filterSelectedOptions
          groupBy={option => option.scope}
          getOptionLabel={option => option.value || ''}
          includeInputInList={true}
          onChange={(e, changedValue) => self.updateFilterKey(changedValue ? changedValue.key : changedValue)}
          options={filters.sort((a, b) => -b.scope.localeCompare(a.scope))}
          renderInput={params => <TextField {...params} label="Attribute" style={textFieldStyle} />}
          value={selectedFilter}
        />
        <div className="margin-left-small margin-right">Equals</div>
        <TextField
          label="Value"
          value={value || ''}
          onChange={e => self.updateFilterValue(e.target.value)}
          InputLabelProps={{ shrink: !!value }}
          style={textFieldStyle}
        />
        {!!self.state.key && (
          <IconButton className="margin-left" onClick={() => self._removeFilter()} size="small">
            <HighlightOffIcon />
          </IconButton>
        )}
        <Loader show={loading} />
      </div>
    );
  }
}
