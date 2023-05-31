// Copyright 2015 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Add as AddIcon } from '@mui/icons-material';
// material ui
import { Button, Chip, Collapse } from '@mui/material';

import { getDeviceAttributes, setDeviceFilters, setDeviceListState } from '../../../actions/deviceActions';
import { saveGlobalSettings } from '../../../actions/userActions';
import { DEVICE_FILTERING_OPTIONS, emptyFilter } from '../../../constants/deviceConstants';
import { deepCompare } from '../../../helpers';
import { getFilterAttributes } from '../../../selectors';
import EnterpriseNotification from '../../common/enterpriseNotification';
import MenderTooltip from '../../common/mendertooltip';
import FilterItem from './filteritem';

export const getFilterLabelByKey = (key, attributes) => {
  const attr = attributes.find(attr => attr.key === key);
  return attr?.value ?? key ?? '';
};

const MAX_PREVIOUS_FILTERS_COUNT = 3;

export const Filters = ({
  attributes,
  canFilterMultiple,
  className = '',
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
  saveGlobalSettings,
  selectedGroup,
  setDeviceFilters,
  setDeviceListState
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
    let changedFilters = [...currentFilters];
    if (editedIndex == currentFilters.length) {
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

  const resetIdFilter = () => setDeviceListState({ selectedId: undefined, setOnly: true });

  const removeFilter = removedFilter => {
    if (removedFilter.key === 'id') {
      resetIdFilter();
    }
    let changedFilters = filters.filter(filter => !deepCompare(filter, removedFilter));
    handleFilterChange(changedFilters);
    if (deepCompare(newFilter, removedFilter)) {
      setNewFilter(emptyFilter);
    }
    const currentFilters = changedFilters.filter(filter => !deepCompare(filter, newFilter));
    setCurrentFilters(currentFilters);
    setEditedIndex(currentFilters.length);
    if (!currentFilters.length) {
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
    <Collapse in={open} timeout="auto" className={`${className} filter-wrapper`} unmountOnExit>
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
  saveGlobalSettings,
  setDeviceFilters,
  setDeviceListState
};

const mapStateToProps = (state, ownProps) => {
  const { plan = 'os' } = state.organization.organization;
  const selectedGroup = state.devices.groups.selectedGroup;
  const groupFilters = state.devices.groups.byId[selectedGroup]?.filters ?? [];
  return {
    attributes: getFilterAttributes(state),
    canFilterMultiple: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    filters: ownProps.filters || state.devices.filters || [],
    groupFilters,
    isHosted: state.app.features.isHosted,
    isEnterprise: state.app.features.isEnterprise,
    plan,
    previousFilters: state.users.globalSettings.previousFilters,
    selectedGroup
  };
};

export default connect(mapStateToProps, actionCreators)(Filters);
