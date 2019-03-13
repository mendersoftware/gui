import React from 'react';

// material ui
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';

export default class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFilters: false,
      filters: this.props.filters || []
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ filters: nextProps.filters });
  }
  _updateFilterKey(index, key) {
    var filterArray = this.state.filters;
    filterArray[index] = { key, value: '' };
    this.setState({ filters: filterArray });
  }
  _updateFilterValue(index, value) {
    var filterArray = this.state.filters;
    filterArray[index].value = value;
    this.setState({ filters: filterArray }, this.props.onFilterChange(filterArray));
  }
  _addFilter() {
    var filterArray = this.state.filters;
    filterArray.push({ key: '', value: '' });
    this.setState({ filters: filterArray });
  }
  _removeFilter(index) {
    var filterArray = this.state.filters;
    if (filterArray.length > 1) {
      filterArray.splice(index, 1);
    } else {
      filterArray = [];
    }
    this.setState({ filters: filterArray }, this.props.onFilterChange(filterArray));
  }
  _toggleNav() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }
  _closeNav() {
    if (!this.state.showFilters) {
      return;
    }
    this.setState({
      showFilters: false
    });
  }
  _clearFilters() {
    this.setState({ filters: [] }, this.props.onFilterChange());
  }
  render() {
    const self = this;
    var attributes = Object.entries(this.props.attributes).reduce(
      (accu, item, index) => {
        accu.push(
          <MenuItem key={index} value={item}>
            {item[1]}
          </MenuItem>
        );
        return accu;
      },
      [
        <MenuItem key="filter-placeholder" disabled>
          Filter by
        </MenuItem>
      ]
    );

    var filterCount = 0;
    var fromProps = self.state.filters.length ? self.state.filters : [{ key: '', value: '' }];
    var filters = fromProps.map((item, index) => {
      filterCount = item.value ? filterCount + 1 : filterCount;
      return (
        <ListItem className="filterPair" key={index}>
          <ListItemText>
            <div>
              {index === 0 && item.value ? (
                <IconButton className="material-icons remove-icon" onClick={() => self._removeFilter(index)} style={{ position: 'absolute' }}>
                  remove_circle
                </IconButton>
              ) : null}
              <Select fullWidth={true} value={item.key} autoWidth={true} onChange={event => self._updateFilterKey(index, event.target.value[0])}>
                {attributes}
              </Select>
            </div>
            <TextField
              value={item.value || ''}
              placeholder="Value"
              fullWidth={true}
              disabled={!item.key}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              onChange={event => self._updateFilterValue(index, event.target.value)}
            />
          </ListItemText>
        </ListItem>
      );
    });

    const drawerStyles = this.state.showFilters ? { overflow: 'visible', top: '57px' } : { overflow: 'hidden', top: '57px' };
    return (
      <div style={{ position: 'relative' }}>
        <Button style={{ position: 'absolute', top: 0, right: 0, zIndex: 100 }} color="secondary" onClick={() => this._toggleNav()}>
          <FilterListIcon className="buttonLabelIcon" />
          {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
        </Button>
        <Drawer
          open={this.state.showFilters}
          docked="false"
          anchor="right"
          opensecondary="true"
          PaperProps={{ style: { width: 320, padding: 20, ...drawerStyles } }}
          BackdropProps={{ style: drawerStyles }}
          onClose={() => this._closeNav()}
        >
          <IconButton
            className="closeSlider"
            onClick={() => this._toggleNav()}
            style={{ position: 'absolute', left: '-25px', background: 'white', top: '20px' }}
          >
            <CloseIcon />
          </IconButton>
          <div className="align-right margin-top-small">
            <a onClick={() => this._clearFilters()}>Clear all filters</a>
          </div>
          <List>{filters}</List>
          {this.props.isHosted ? (
            <Button variant="text" disabled={!filterCount} onClick={() => this._addFilter()} color="secondary">
              <AddCircleIcon className="buttonLabelIcon" />
              Add filter
            </Button>
          ) : null}
        </Drawer>
      </div>
    );
  }
}
