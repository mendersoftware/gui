import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Collapse } from '@material-ui/core';

import { AddCircle as AddCircleIcon, FilterList as FilterListIcon } from '@material-ui/icons';

import { selectDevice as resetIdFilter, setDeviceFilters } from '../../actions/deviceActions';
import EnterpriseNotification from '../common/enterpriseNotification';
import FilterItem from './filteritem';

const emptyFilter = { key: undefined, value: undefined, scope: '' };

export class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFilters: false
    };
  }

  componentDidMount() {
    this.onFilterChange(this.props.filters);
  }

  componentWillUnmount() {
    this.clearFilters();
  }

  _updateFilters(filter, index) {
    let filters = this.props.filters;
    filters[index] = filter;
    this.onFilterChange(filters);
  }

  _removeFilter(index) {
    const filter = this.props.filters.splice(index, 1)[0];
    if (filter && filter.key === 'id') {
      this.props.resetIdFilter();
    }
    this.onFilterChange(this.props.filters);
  }

  clearFilters() {
    this.onFilterChange([]);
    this.props.resetIdFilter();
  }

  onFilterChange(filters) {
    var self = this;
    self.props.setDeviceFilters(filters);
    self.props.onFilterChange(filters);
  }

  render() {
    const self = this;
    const { attributes, canFilterMultiple, filters: originalFilters, isHosted } = self.props;
    const { showFilters } = self.state;
    const filters = originalFilters.length ? originalFilters : [emptyFilter];
    const { filterAttributes, filterCount, remainingFilters } = [{ key: 'id', value: 'Device ID', scope: 'identity' }, ...attributes].reduce(
      (accu, currentFilter) => {
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

    const canAddMore = remainingFilters.length && filterCount;
    return (
      <>
        <Button color="secondary" onClick={() => self.setState({ showFilters: !showFilters })} startIcon={<FilterListIcon />}>
          {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
        </Button>
        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <div className="flexbox space-between filter-wrapper">
            <div>
              {filters.map((item, index) => (
                <FilterItem
                  index={index}
                  key={`refresh-${index}`}
                  itemKey={`refresh-${index}`}
                  filter={item}
                  filters={remainingFilters}
                  filterAttributes={filterAttributes}
                  onRemove={() => self._removeFilter(index)}
                  onSelect={filter => self._updateFilters(filter, index)}
                />
              ))}
            </div>
            <div className="flexbox column space-between">
              {filters.length > 1 ? (
                <span className="align-right link margin-top-small margin-right-small" onClick={() => self.clearFilters()}>
                  Clear all filters
                </span>
              ) : (
                <span />
              )}
              {canFilterMultiple ? (
                <Button
                  className="margin-bottom"
                  disabled={!canAddMore}
                  onClick={() => self.onFilterChange([...originalFilters, emptyFilter])}
                  startIcon={<AddCircleIcon />}
                  color="secondary"
                >
                  Add filter
                </Button>
              ) : (
                <EnterpriseNotification
                  isEnterprise={canFilterMultiple}
                  recommendedPlan={isHosted ? 'professional' : null}
                  benefit="filter by multiple attributes to improve the device overview"
                />
              )}
            </div>
          </div>
        </Collapse>
      </>
    );
  }
}

const actionCreators = {
  resetIdFilter,
  setDeviceFilters
};

const mapStateToProps = (state, ownProps) => {
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  let attributes = state.devices.filteringAttributes.identityAttributes.map(item => ({ key: item, value: item, scope: 'identity' }));
  if (!ownProps.identityOnly) {
    attributes = [...attributes, ...state.devices.filteringAttributes.inventoryAttributes.map(item => ({ key: item, value: item, scope: 'inventory' }))];
  }
  return {
    attributes,
    canFilterMultiple: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    filters: state.devices.filters || [],
    isHosted: state.app.features.isEnterprise || state.app.features.isHosted
  };
};

export default connect(mapStateToProps, actionCreators)(Filters);
