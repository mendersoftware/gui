import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Collapse } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { getDeviceAttributes, selectDevice as resetIdFilter, setDeviceFilters } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
import EnterpriseNotification from '../common/enterpriseNotification';
import MenderTooltip from '../common/mendertooltip';
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
  getDeviceAttributes,
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
  const [currentFilters, setCurrentFilters] = useState([]);
  const [editedIndex, setEditedIndex] = useState(0);

  useEffect(() => {
    setCurrentFilters(filters);
    setEditedIndex(filters.length);
    getDeviceAttributes();
  }, [open]);

  useEffect(() => {
    setAdding(adding && groupFilters.length ? isModification : true);
    setNewFilter(emptyFilter);
  }, [isModification, groupFilters.length]);

  const updateFilter = newFilter => {
    setNewFilter(newFilter);
    saveUpdatedFilter(newFilter);
    let changedFilters = [...filters];
    if (editedIndex == filters.length) {
      changedFilters.push(newFilter);
      return handleFilterChange(changedFilters);
    }
    changedFilters[editedIndex] = newFilter;
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
    let changedFilters = filters.filter(filter => !deepCompare(filter, removedFilter));
    if (removedFilter.key === 'id') {
      resetIdFilter();
    }
    handleFilterChange(changedFilters);
    if (deepCompare(newFilter, removedFilter)) {
      setNewFilter(emptyFilter);
    } else {
      changedFilters =
        changedFilters.length && deepCompare(changedFilters[changedFilters.length - 1], newFilter)
          ? changedFilters.slice(0, changedFilters.length - 1)
          : changedFilters;
      setEditedIndex(changedFilters.length);
    }
    setCurrentFilters(changedFilters);
    if (!changedFilters.length) {
      setAdding(true);
    }
  };

  const clearFilters = () => {
    handleFilterChange([]);
    resetIdFilter();
    setCurrentFilters([]);
    setEditedIndex(0);
    setNewFilter(emptyFilter);
  };

  const onAddClick = () => {
    setAdding(true);
    setEditedIndex(filters.length);
    if (Object.values(newFilter).every(thing => !!thing)) {
      setCurrentFilters([...currentFilters, newFilter]);
    }
    setNewFilter(emptyFilter);
  };

  const handleFilterChange = filters => {
    const activeFilters = filters.filter(item => item.value !== '');
    setDeviceFilters(activeFilters);
    onFilterChange();
    if (activeFilters.length === 0) {
      setAdding(true);
    }
  };

  const filter = filters.find(filter => deepCompare(filter, newFilter)) || newFilter;
  const isFilterDefined = filter && Object.values(filter).every(thing => !!thing);
  const addButton = <Chip icon={<AddIcon />} label="Add a rule" color="primary" onClick={onAddClick} />;
  return (
    <Collapse in={open} timeout="auto" className="filter-wrapper" unmountOnExit>
      <>
        <div className="flexbox">
          <div className="margin-right" style={{ marginTop: currentFilters.length ? 8 : 25 }}>
            Devices matching:
          </div>
          <div>
            {currentFilters.length ? (
              <div className="filter-list">
                {currentFilters.map(item => (
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
          {!!filters.length && !groupFilters.length && (
            <span className="link margin-small margin-top-none" onClick={clearFilters}>
              Clear filter
            </span>
          )}
          <EnterpriseNotification
            isEnterprise={isEnterprise || (isHosted && plan === 'enterprise')}
            benefit="filtering by multiple attributes to improve the device overview and the creation of dynamic groups to ease device management"
          />
          {canFilterMultiple && (plan === 'enterprise' || isEnterprise) && filters.length >= 1 && (
            <>
              {selectedGroup ? (
                !!groupFilters.length && (
                  <MenderTooltip
                    title="Saved changes will not change the target devices of any ongoing deployments to this group, but will take effect for new deployments"
                    arrow
                  >
                    <Button variant="contained" color="secondary" onClick={onGroupClick}>
                      Save group
                    </Button>
                  </MenderTooltip>
                )
              ) : (
                <Button variant="contained" color="secondary" onClick={onGroupClick}>
                  Create group with this filter
                </Button>
              )}
            </>
          )}
        </div>
      </>
    </Collapse>
  );
};

const actionCreators = {
  getDeviceAttributes,
  resetIdFilter,
  saveGlobalSettings,
  setDeviceFilters
};

const mapStateToProps = (state, ownProps) => {
  const { plan = 'os' } = state.organization.organization;
  const deviceNameAttribute = { key: 'name', value: 'Name', scope: 'tags', category: 'tags', priority: 1 };
  const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 };
  const attributes = [
    ...state.users.globalSettings.previousFilters.map(item => ({
      ...item,
      value: deviceIdAttribute.key === item.key ? deviceIdAttribute.value : item.key,
      category: 'recently used',
      priority: 0
    })),
    deviceNameAttribute,
    deviceIdAttribute,
    ...state.devices.filteringAttributes.identityAttributes.map(item => ({ key: item, value: item, scope: 'identity', category: 'identity', priority: 1 })),
    ...state.devices.filteringAttributes.inventoryAttributes.map(item => ({ key: item, value: item, scope: 'inventory', category: 'inventory', priority: 2 })),
    ...state.devices.filteringAttributes.tagAttributes.map(item => ({ key: item, value: item, scope: 'tags', category: 'tags', priority: 3 }))
  ];
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
