import React from 'react';

// material ui
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';

import FilterItem from './filteritem';

export default class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFilters: false,
      filters: this.props.filters
    };
  }
  _addFilter() {
    var filterArray = this.state.filters;
    filterArray.push({ key: '', value: '' });
    this.setState({ filters: filterArray });
  }
  _updateFilters(filter, index) {
    let filters = this.state.filters;
    filters[index] = filter;
    this.setState({ filters }, this.props.onFilterChange(filters));
  }
  _removeFilter(index) {
    var filterArray = this.state.filters;
    filterArray.splice(index, 1);
    this.setState({ filters: filterArray }, this.props.onFilterChange(filterArray));
  }
  _toggleNav() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }
  _clearFilters() {
    this.setState({ filters: [] }, this.props.onFilterChange([]));
  }
  render() {
    const self = this;
    const filters = self.state.filters.length ? self.state.filters : [{ key: '', value: '' }];
    var filterCount = 0;
    const filterAttributes = Object.entries(self.props.attributes).map(item => ({ key: item[0], value: item[1] }));

    const remainingFilters = filterAttributes.reduce((accu, item) => {
      const isInUse = filters.find(filter => filter.key === item.key);
      if (isInUse) {
        filterCount = filterCount + 1;
      } else {
        accu.push(item);
      }
      return accu;
    }, []);

    const filterItems = filters.map((item, index) => (
      <FilterItem
        key={index}
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
          PaperProps={{ style: { width: 320, padding: 20, ...drawerStyles } }}
          BackdropProps={{ style: drawerStyles }}
          onClose={() => self.setState({ showFilters: false })}
        >
          <IconButton
            className="closeSlider"
            onClick={() => self.setState({ showFilters: false })}
            style={{ position: 'absolute', left: '-25px', background: 'white', top: '20px' }}
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
          ) : null}
        </Drawer>
      </div>
    );
  }
}
