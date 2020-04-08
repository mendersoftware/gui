import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Collapse } from '@material-ui/core';
import { Add as AddIcon, FilterList as FilterListIcon } from '@material-ui/icons';

import { selectDevice as resetIdFilter, setDeviceFilters } from '../../actions/deviceActions';
import EnterpriseNotification from '../common/enterpriseNotification';
import FilterItem from './filteritem';

import { DEVICE_FILTERING_OPTIONS } from '../../constants/deviceConstants';

export const emptyFilter = { key: undefined, value: undefined, operator: '$eq', scope: 'inventory' };

export class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: props.isModification || true,
      newFilter: emptyFilter,
      showFilters: false
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
    if (filterIndex === -1) {
      return this.onFilterChange([...this.props.filters, newFilter]);
    }
    this.props.filters[filterIndex] = newFilter;
    this.onFilterChange(this.props.filters);
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
    this.props.setDeviceFilters(filters);
    this.props.onFilterChange(filters);
  }

  render() {
    const self = this;
    const { attributes, canFilterMultiple, filters, isHosted, onGroupClick, plan, selectedGroup } = self.props;
    const { adding, newFilter, showFilters } = self.state;
    const addedFilters = filters.filter(filter => filter.key !== newFilter.key);
    const { currentFilters, remainingFilters } = attributes.reduce(
      (accu, currentFilter) => {
        const isInUse = filters.find(filter => filter.key === currentFilter.key);
        if (isInUse) {
          accu.currentFilters.push(currentFilter);
        } else if (!addedFilters.length || (addedFilters.length && currentFilter.scope === addedFilters[0].scope)) {
          accu.remainingFilters.push(currentFilter);
        }
        return accu;
      },
      { currentFilters: [], remainingFilters: [] }
    );

    const addButton = canFilterMultiple ? (
      <Chip
        icon={<AddIcon />}
        disabled={!remainingFilters.length}
        label="Add a rule"
        color="primary"
        onClick={() => self.setState({ adding: !adding, newFilter: emptyFilter })}
      />
    ) : (
      <EnterpriseNotification
        isEnterprise={canFilterMultiple}
        recommendedPlan={isHosted ? 'professional' : null}
        benefit="filter by multiple attributes to improve the device overview"
      />
    );

    const canSaveFilter = newFilter.scope === 'inventory' || (addedFilters.length && addedFilters[0].scope === 'inventory');
    const filter = filters.find(item => item.key === newFilter.key) || newFilter;
    const addedFilterDefined = filter && Object.values(filter).every(thing => !!thing);
    return (
      <>
        <Button color="secondary" onClick={() => self.setState({ showFilters: !showFilters })} startIcon={<FilterListIcon />} style={{ marginTop: -8 }}>
          {filters.length > 0 ? `Filters (${filters.length})` : 'Filters'}
        </Button>
        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <>
            <div className="flexbox">
              <div className="margin-right" style={{ marginTop: currentFilters.length ? 8 : 25 }}>
                Devices matching:
              </div>
              <div>
                <div>
                  {addedFilters.map(item => (
                    <Chip
                      className="margin-right-small"
                      key={`filter-${item.key}`}
                      label={`${item.key} ${DEVICE_FILTERING_OPTIONS[item.operator].shortform} ${item.operator === '$regex' ? `${item.value}.*` : item.value}`}
                      onDelete={() => self.removeFilter(item)}
                    />
                  ))}
                  {!adding && addButton}
                </div>
                {adding && (
                  <FilterItem
                    filter={filter}
                    filters={remainingFilters}
                    onRemove={filter => self.removeFilter(filter)}
                    onSelect={filter => self.updateFilter(filter)}
                    plan={plan}
                  />
                )}
                {addedFilterDefined && addButton}
              </div>
            </div>
            <div className="flexbox margin-top-small margin-bottom-small" style={{ justifyContent: 'flex-end' }}>
              {filters.length > 1 && (
                <span className="link margin-top-small margin-right-small" onClick={() => self.clearFilters()}>
                  Clear filter
                </span>
              )}
              {!canFilterMultiple && (
                <EnterpriseNotification
                  isEnterprise={canFilterMultiple}
                  recommendedPlan={isHosted ? 'professional' : null}
                  benefit="filter by multiple attributes to improve the device overview"
                />
              )}
              {plan !== 'enterprise' && (
                <EnterpriseNotification
                  isEnterprise={false}
                  recommendedPlan="enterprise"
                  benefit="filter by multiple attributes to improve the device overview"
                />
              )}
              {canFilterMultiple && plan === 'enterprise' && currentFilters.length >= 1 && canSaveFilter && (
                <Button variant="contained" color="secondary" onClick={onGroupClick}>
                  {selectedGroup ? 'Save group' : 'Create group with this filter'}
                </Button>
              )}
            </div>
          </>
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
  let attributes = [
    { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 },
    ...state.devices.filteringAttributes.identityAttributes.map(item => ({ key: item, value: item, scope: 'identity', category: 'identity', priority: 1 }))
  ];
  if (!ownProps.identityOnly) {
    attributes = [
      ...state.users.globalSettings.previousFilters.map(item => ({
        key: item.value,
        value: item.value,
        scope: item.scope,
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
    isHosted: state.app.features.isEnterprise || state.app.features.isHosted,
    plan,
    selectedGroup: state.devices.groups.selectedGroup
  };
};

export default connect(mapStateToProps, actionCreators)(Filters);
