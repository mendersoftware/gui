import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Collapse } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { selectDevice as resetIdFilter, setDeviceFilters } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
import EnterpriseNotification from '../common/enterpriseNotification';
import FilterItem from './filteritem';

import { DEVICE_FILTERING_OPTIONS } from '../../constants/deviceConstants';
import { deepCompare } from '../../helpers';

export const emptyFilter = { key: null, value: '', operator: '$eq', scope: 'inventory' };

export const getFilterLabelByKey = (key, attributes) => {
  const attr = attributes.find(attr => attr.key === key);
  return attr != undefined ? attr.value : key;
};

const MAX_PREVIOUS_FILTERS_COUNT = 3;

export const Filters = ({
  attributes,
  canFilterMultiple,
  filters,
  groupFilters,
  isEnterprise,
  isHosted,
  isModification = true,
  onFilterChange,
  onGroupClick,
  open,
  plan,
  previousFilters,
  resetIdFilter,
  selectedGroup,
  setDeviceFilters
}) => {
  const [adding, setAdding] = useState(isModification);
  const [newFilter, setNewFilter] = useState(emptyFilter);

  useEffect(() => {
    setAdding(adding && groupFilters.length ? isModification : true);
    setNewFilter(emptyFilter);
  }, [isModification, groupFilters.length]);

  const updateFilter = newFilter => {
    setNewFilter(newFilter);
    let filterIndex = filters.findIndex(filter => deepCompare(filter, newFilter));
    saveUpdatedFilter(newFilter);
    let changedFilters = [...filters];
    if (filterIndex === -1) {
      changedFilters.push(newFilter);
      return handleFilterChange(changedFilters);
    }
    changedFilters[filterIndex] = newFilter;
    handleFilterChange(changedFilters);
  };

  const saveUpdatedFilter = newFilter => {
    let changedPreviousFilters = [...previousFilters];
    if (!changedPreviousFilters.find(filter => deepCompare(filter, newFilter))) {
      changedPreviousFilters.push(newFilter);
      saveGlobalSettings({ previousFilters: changedPreviousFilters.slice(-1 * MAX_PREVIOUS_FILTERS_COUNT) });
    }
  };

  const removeFilter = removedFilter => {
    const changedFilters = filters.filter(filter => !deepCompare(filter, removedFilter));
    if (removedFilter.key === 'id') {
      resetIdFilter();
    }
    if (removedFilter.key === newFilter.key) {
      setNewFilter(emptyFilter);
    }
    if (!changedFilters.length) {
      setAdding(true);
    }
    handleFilterChange(changedFilters);
  };

  const clearFilters = () => {
    handleFilterChange([]);
    resetIdFilter();
    setNewFilter(emptyFilter);
  };

  const onAddClick = () => {
    setAdding(true);
    setNewFilter(emptyFilter);
  };

  const handleFilterChange = filters => {
    const activeFilters = filters.filter(item => item.value !== '');
    setDeviceFilters(activeFilters);
    onFilterChange(activeFilters);
    if (activeFilters.length === 0) {
      setAdding(true);
    }
  };

  const addedFilters = filters.filter(filter => filter !== newFilter);
  const filter = filters.find(filter => deepCompare(filter, newFilter)) || newFilter;
  const isFilterDefined = filter && Object.values(filter).every(thing => !!thing);
  const addButton = <Chip icon={<AddIcon />} label="Add a rule" color="primary" onClick={onAddClick} />;
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
                    key={`filter-${item.key}-${item.operator}-${item.value}`}
                    label={`${getFilterLabelByKey(item.key, attributes)} ${DEVICE_FILTERING_OPTIONS[item.operator].shortform} ${
                      item.operator !== '$exists' && item.operator !== '$nexists' ? (item.operator === '$regex' ? `${item.value}.*` : item.value) : ''
                    }`}
                    onDelete={() => removeFilter(item)}
                  />
                ))}
                {!adding && addButton}
              </div>
            ) : null}
            {adding && <FilterItem attributes={attributes} filter={filter} onRemove={removeFilter} onSelect={updateFilter} plan={plan} />}
            {isFilterDefined && addButton}
          </div>
        </div>
        <div className="flexbox column margin-top-small margin-bottom-small" style={{ alignItems: 'flex-end' }}>
          {filters.length > 0 && (
            <span className="link margin-small margin-top-none" onClick={clearFilters}>
              Clear filter
            </span>
          )}
          <EnterpriseNotification
            isEnterprise={isEnterprise || (isHosted && plan === 'enterprise')}
            benefit="filtering by multiple attributes to improve the device overview and the creation of dynamic groups to ease device management"
          />
          {!selectedGroup && canFilterMultiple && (plan === 'enterprise' || isEnterprise) && filters.length >= 1 && (
            <Button variant="contained" color="secondary" onClick={onGroupClick}>
              Create group with this filter
            </Button>
          )}
        </div>
      </>
    </Collapse>
  );
};

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
  const selectedGroup = state.devices.groups.selectedGroup;
  const groupFilters = state.devices.groups.byId[selectedGroup]?.filters ?? [];
  return {
    attributes: attributes.filter((item, index, array) => array.findIndex(filter => filter.key === item.key && filter.scope === item.scope) == index),
    canFilterMultiple: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    filters: ownProps.filters || state.devices.filters || [],
    groupFilters,
    isHosted: state.app.features.isHosted,
    isEnterprise: state.app.features.isEnterprise,
    plan,
    previousFilters: state.users.globalSettings.previousFilters || [],
    selectedGroup
  };
};

export default connect(mapStateToProps, actionCreators)(Filters);
