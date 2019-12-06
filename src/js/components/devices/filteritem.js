import React from 'react';

// material ui
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, ListItem, ListItemText, MenuItem, TextField } from '@material-ui/core';

import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

export default class FilterItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedFilterKey: this.props.filter.key || '', // this refers to the selected filter with key as the id
      selectedValue: this.props.filter.value || '' // while this is the value that is applied with the filter
    };
  }
  _updateFilterValue(selectedValue) {
    this.setState({ selectedValue }, this.props.onSelect({ key: this.state.selectedFilterKey, value: selectedValue }));
  }
  _removeFilter() {
    this.setState({ selectedFilterKey: '', selectedValue: '' }, this.props.onRemove());
  }
  render() {
    const self = this;
    const { filters, filterAttributes, index } = self.props;

    let availableFilters = [
      <MenuItem key="filter-placeholder" value="" disabled>
        Filter by
      </MenuItem>
    ];

    const currentFilter = filterAttributes.find(item => item.key === self.state.selectedFilterKey);
    if (currentFilter) {
      availableFilters = [
        <MenuItem key="currentValue" value={currentFilter.key}>
          {currentFilter.value}
        </MenuItem>
      ];
    } else {
      availableFilters = filters.reduce((accu, item) => {
        accu.push(
          <MenuItem key={item.key} value={item.key}>
            {item.value}
          </MenuItem>
        );
        return accu;
      }, availableFilters);
    }

    return (
      <ListItem className="filterPair">
        <ListItemText>
          <TextField
            select
            value={self.state.selectedFilterKey}
            label="Filter by"
            onChange={event => self.setState({ selectedFilterKey: event.target.value })}
            InputProps={{
              endAdornment: self.state.selectedFilterKey ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => self._removeFilter()}>
                    <RemoveCircleIcon />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          >
            {availableFilters}
          </TextField>

          <FormControl error={Boolean(self.state.errortext)}>
            <InputLabel htmlFor={`filter-${index}`}>Value</InputLabel>
            <Input
              id={`filter-${index}`}
              value={self.state.selectedValue}
              placeholder="Value"
              fullWidth={true}
              disabled={!self.state.selectedFilterKey}
              onChange={event => self._updateFilterValue(event.target.value)}
              type="text"
            />
            <FormHelperText>{self.state.errortext}</FormHelperText>
          </FormControl>
        </ListItemText>
      </ListItem>
    );
  }
}
