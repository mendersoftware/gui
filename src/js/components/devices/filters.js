import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Collapse } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { selectDevice as resetIdFilter, setDeviceFilters } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
import EnterpriseNotification from '../common/enterpriseNotification';
import FilterItem from './filteritem';

import { DEVICE_FILTERING_OPTIONS } from '../../constants/deviceConstants';

export const emptyFilter = { key: null, value: '', operator: '$eq', scope: 'inventory' };

export const getFilterLabelByKey = (key, attributes) => {
  const attr = attributes.find(attr => attr.key === key);
  return attr != undefined ? attr.value : key;
};

const MAX_PREVIOUS_FILTERS_COUNT = 3;

export class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: props.isModification || true,
      newFilter: emptyFilter
    };
  }

  componentDidMount() {
    this.onFilterChange(this.props.filters);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isModification !== this.props.isModification) {
      this.setState({ newFilter: emptyFilter, adding: !this.props.isModification });
    }
  }

  componentWillUnmount() {
    this.clearFilters();
  }

  updateFilter(newFilter) {
    this.setState({ newFilter });
    let filterIndex = this.props.filters.findIndex(filter => filter.key === newFilter.key);
    this.saveUpdatedFilter(newFilter);
    if (filterIndex === -1) {
      return this.onFilterChange([...this.props.filters, newFilter]);
    }
    this.props.filters[filterIndex] = newFilter;
    this.onFilterChange(this.props.filters);
  }

  saveUpdatedFilter(newFilter) {
    let previousFilters = this.props.previousFilters;
    if (!previousFilters.find(filter => newFilter.key === filter.key)) {
      previousFilters.push(newFilter);
      this.props.saveGlobalSettings({ previousFilters: previousFilters.slice(-1 * MAX_PREVIOUS_FILTERS_COUNT) });
    }
  }

  removeFilter(removedFilter) {
    const filters = this.props.filters.filter(filter => filter.key !== removedFilter.key);
    if (removedFilter.key === 'id') {
      this.props.resetIdFilter();
    }
    if (removedFilter.key === this.state.newFilter.key) {
      this.setState({ newFilter: emptyFilter });
    }
    if (!filters.length) {
      this.setState({ adding: true });
    }
    this.onFilterChange(filters);
  }

  clearFilters() {
    this.onFilterChange([]);
    this.props.resetIdFilter();
  }

  onFilterChange(filters) {
    const activeFilters = filters.filter(item => item.value !== '');
    this.props.setDeviceFilters(activeFilters);
    this.props.onFilterChange(activeFilters);
    if (activeFilters.length === 0) {
      this.setState({ adding: true });
    }
  }

  render() {
    const self = this;
    const { attributes, canFilterMultiple, filters, isEnterprise, isHosted, onGroupClick, open, plan, selectedGroup } = self.props;
    const { adding, newFilter } = self.state;
    const addedFilters = filters.filter(filter => filter.key !== newFilter.key);
    const { currentFilters, remainingFilters } = attributes.reduce(
      (accu, currentFilter) => {
        const isInUse = filters.find(filter => filter.key === currentFilter.key);
        if (isInUse) {
          accu.currentFilters.push(currentFilter);
        } else {
          accu.remainingFilters.push(currentFilter);
        }
        return accu;
      },
      { currentFilters: [], remainingFilters: [] }
    );

    const addButton = (
      <Chip
        icon={<AddIcon />}
        disabled={!remainingFilters.length}
        label="Add a rule"
        color="primary"
        onClick={() => self.setState({ adding: !adding, newFilter: emptyFilter })}
      />
    );

    const filter = filters.find(item => item.key === newFilter.key) || newFilter;
    const addedFilterDefined = filter && Object.values(filter).every(thing => !!thing);
    return (
      <Collapse in={open} timeout="auto" className="filter-wrapper" unmountOnExit>
        <>
          <div className="flexbox">
            <div className="margin-right" style={{ marginTop: addedFilters.length ? 8 : 25 }}>
              Devices matching:
            </div>
            <div>
              {addedFilters.length ? (
                <div className="filter-list">
                  {addedFilters.map(item => (
                    <Chip
                      className="margin-right-small"
                      key={`filter-${item.key}`}
                      label={`${getFilterLabelByKey(item.key, self.props.attributes)} ${DEVICE_FILTERING_OPTIONS[item.operator].shortform} ${
                        item.operator !== '$exists' && item.operator !== '$nexists' ? (item.operator === '$regex' ? `${item.value}.*` : item.value) : ''
                      }`}
                      onDelete={() => self.removeFilter(item)}
                    />
                  ))}
                  {!adding && addButton}
                </div>
              ) : null}
              {adding && (
                <FilterItem
                  filter={filter}
                  filters={remainingFilters}
                  attributes={attributes}
                  onRemove={filter => self.removeFilter(filter)}
                  onSelect={filter => self.updateFilter(filter)}
                  plan={plan}
                />
              )}
              {addedFilterDefined && addButton}
            </div>
          </div>
          <div className="flexbox column margin-top-small margin-bottom-small" style={{ alignItems: 'flex-end' }}>
            {filters.length > 0 && (
              <span className="link margin-top-small margin-right-small" onClick={() => self.clearFilters()}>
                Clear filter
              </span>
            )}
            <EnterpriseNotification
              isEnterprise={isEnterprise || (isHosted && plan === 'enterprise')}
              benefit="filtering by multiple attributes to improve the device overview and the creation of dynamic groups to ease device management"
            />
            {canFilterMultiple && (plan === 'enterprise' || isEnterprise) && currentFilters.length >= 1 && (
              <Button variant="contained" color="secondary" onClick={onGroupClick}>
                {selectedGroup ? 'Save group' : 'Create group with this filter'}
              </Button>
            )}
          </div>
        </>
      </Collapse>
    );
  }
}

const actionCreators = {
  resetIdFilter,
  saveGlobalSettings,
  setDeviceFilters
};

const mapStateToProps = (state, ownProps) => {
  const { plan = 'os' } = state.organization.organization;
  const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 };
  let attributes = [
    deviceIdAttribute,
    ...state.devices.filteringAttributes.identityAttributes.map(item => ({ key: item, value: item, scope: 'identity', category: 'identity', priority: 1 }))
  ];
  if (!ownProps.identityOnly) {
    attributes = [
      ...state.users.globalSettings.previousFilters.map(item => ({
        ...item,
        value: deviceIdAttribute.key === item.key ? deviceIdAttribute.value : item.key,
        category: 'recently used',
        priority: 0
      })),
      ...attributes,
      ...state.devices.filteringAttributes.inventoryAttributes.map(item => ({ key: item, value: item, scope: 'inventory', category: 'inventory', priority: 2 }))
    ];
  }
  return {
    attributes: attributes.filter((item, index, array) => array.findIndex(filter => filter.key === item.key) == index),
    canFilterMultiple: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    filters: ownProps.filters || state.devices.filters || [],
    isHosted: state.app.features.isHosted,
    isEnterprise: state.app.features.isEnterprise,
    plan,
    previousFilters: state.users.globalSettings.previousFilters || [],
    selectedGroup: state.devices.groups.selectedGroup
  };
};

export default connect(mapStateToProps, actionCreators)(Filters);
