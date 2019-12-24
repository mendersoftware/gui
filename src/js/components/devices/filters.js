import React from 'react';

// material ui
import { Button, Drawer, IconButton, List } from '@material-ui/core';

import { AddCircle as AddCircleIcon, Close as CloseIcon, FilterList as FilterListIcon } from '@material-ui/icons';

import FilterItem from './filteritem';
import EnterpriseNotification from '../common/enterpriseNotification';

export default class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFilters: false
    };
  }
  _addFilter() {
    this.props.onFilterChange([...this.props.filters, { key: '', value: '' }]);
  }
  _updateFilters(filter, index) {
    let filters = this.props.filters;
    filters[index] = filter;
    this.props.onFilterChange(filters);
  }
  _removeFilter(index) {
    const filter = this.props.filters.splice(index, 1)[0];
    if (filter.key === 'id') {
      this.props.resetIdFilter();
    }

    this.props.onFilterChange(this.props.filters);
  }
  _toggleNav() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }
  _clearFilters() {
    this.props.onFilterChange([]);
  }
  render() {
    const self = this;
    const filters = self.props.filters.length ? self.props.filters : [{ key: '', value: '' }];
    const { filterAttributes, filterCount, remainingFilters } = [{ key: 'id', value: 'Device ID' }, ...self.props.attributes].reduce(
      (accu, value) => {
        const currentFilter = value.key ? value : { value, key: value };
        accu.filterAttributes.push(currentFilter);
        const isInUse = filters.find(filter => filter.key === currentFilter.key);
        if (isInUse) {
          accu.filterCount += 1;
        } else {
          accu.remainingFilters.push(currentFilter);
        }
        return accu;
      },
      { filterAttributes: [], filterCount: 0, remainingFilters: [] }
    );
    const filterItems = filters.map((item, index) => (
      <FilterItem
        key={self.props.filters.length ? item.key : `refresh-${item.key}`}
        index={index}
        filter={item}
        filters={remainingFilters}
        filterAttributes={filterAttributes}
        onRemove={() => self._removeFilter(index)}
        onSelect={filter => self._updateFilters(filter, index)}
      />
    ));

    const canAddMore = remainingFilters.length && filterCount;
    const drawerStyles = this.state.showFilters ? { overflow: 'visible', top: '57px' } : { overflow: 'hidden', top: '57px' };
    return (
      <div style={{ position: 'relative' }}>
        <Button style={{ position: 'absolute', top: 0, right: 0, zIndex: 100 }} color="secondary" onClick={() => self.setState({ showFilters: true })}>
          <FilterListIcon className="buttonLabelIcon" />
          {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
        </Button>
        <Drawer
          open={this.state.showFilters}
          docked="false"
          anchor="right"
          opensecondary="true"
          PaperProps={{ style: { width: 335, padding: 15, ...drawerStyles } }}
          BackdropProps={{ style: drawerStyles }}
          onClose={() => self.setState({ showFilters: false })}
        >
          <IconButton
            className="closeSlider"
            onClick={() => self.setState({ showFilters: false })}
            style={{ position: 'absolute', left: '-25px', background: 'white', top: 15 }}
          >
            <CloseIcon />
          </IconButton>
          <div className="align-right margin-top-small">
            <a onClick={() => this._clearFilters()}>Clear all filters</a>
          </div>
          <List>{filterItems}</List>
          {this.props.isHosted ? (
            <Button variant="text" disabled={!canAddMore} onClick={() => this._addFilter()} color="secondary">
              <AddCircleIcon className="buttonLabelIcon" />
              Add filter
            </Button>
          ) : (
            <EnterpriseNotification isEnterprise={this.props.isHosted} benefit="filter by multiple attributes to improve the device overview" />
          )}
        </Drawer>
      </div>
    );
  }
}
