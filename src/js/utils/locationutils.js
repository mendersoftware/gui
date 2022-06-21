import { ATTRIBUTE_SCOPES, DEVICE_FILTERING_OPTIONS, DEVICE_LIST_DEFAULTS, UNGROUPED_GROUP } from '../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../constants/organizationConstants';
import { routes } from '../components/devices/base-devices';
import { emptyFilter } from '../components/devices/widgets/filters';
import { deepCompare } from '../helpers';

const SEPARATOR = ':';

const commonFields = {
  ...Object.keys(DEVICE_LIST_DEFAULTS).reduce((accu, key) => ({ ...accu, [key]: Number }), {}),
  id: String,
  issues: undefined,
  open: Boolean
};

const scopes = {
  identity: { delimiter: 'identity', filters: [] },
  inventory: { delimiter: 'inventory', filters: [] },
  monitor: { delimiter: 'monitor', filters: [] },
  tags: { delimiter: 'tags', filters: [] }
};

export const commonProcessor = searchParams => {
  let params = new URLSearchParams(searchParams);
  const pageState = Object.entries(commonFields).reduce((accu, [key, parse]) => {
    const values = params.getAll(key);
    if (!values.length) {
      return accu;
    }
    if (!parse) {
      accu[key] = values;
    } else {
      try {
        accu[key] = parse(values[0]);
      } catch (error) {
        console.log('encountered faulty url param, continue...', error);
      }
    }
    return accu;
  }, {});
  Object.keys(commonFields).map(key => params.delete(key));
  const sort = params.has('sort')
    ? params.getAll('sort').reduce((sortAccu, scopedQuery) => {
        const items = scopedQuery.split(SEPARATOR).reverse();
        return ['direction', 'key', 'scope'].reduce((accu, key, index) => {
          if (items[index]) {
            accu[key] = items[index];
          }
          return accu;
        }, sortAccu);
      }, {})
    : undefined;
  params.delete('sort');
  return { pageState, params, sort };
};

const legacyDeviceQueryParse = (searchParams, filteringAttributes) => {
  let params = new URLSearchParams(searchParams);
  const result = Object.keys(scopes).reduce((accu, scope) => ({ ...accu, [scope]: [] }), {});
  const filters = [...params.keys()].reduce(
    (accu, key) =>
      params.getAll(key).reduce((innerAccu, query) => {
        const value = decodeURIComponent(query);
        const scope =
          Object.entries(filteringAttributes).reduce((foundScope, [currentScope, attributes]) => {
            if (foundScope) {
              return foundScope;
            }
            return attributes.includes(key) ? currentScope.substring(0, currentScope.indexOf('Attributes')) : foundScope;
          }, undefined) ?? ATTRIBUTE_SCOPES.inventory;
        innerAccu[scope].push({ ...emptyFilter, scope, key, operator: DEVICE_FILTERING_OPTIONS.$eq.key, value });
        return innerAccu;
      }, accu),
    result
  );
  [...params.keys()].map(key => params.delete(key));
  return { filters, params };
};

const scopedFilterParse = searchParams => {
  let params = new URLSearchParams(searchParams);
  const filters = Object.keys(scopes).reduce(
    (accu, scope) => {
      accu[scope] = [];
      if (!params.has(scope)) {
        return accu;
      }
      accu[scope] = params.getAll(scope).map(scopedQuery => {
        const items = scopedQuery.split(SEPARATOR);
        return { ...emptyFilter, scope, key: items[0], operator: `$${items[1]}`, value: decodeURIComponent(items[2]) };
      });
      return accu;
    },
    { ...scopes }
  );
  Object.keys(scopes).map(scope => params.delete(scope));
  return { filters, params };
};

// filters, selectedGroup
export const parseDeviceQuery = (searchParams, extraProps = {}) => {
  let queryParams = new URLSearchParams(searchParams);
  const { filteringAttributes = {} } = extraProps;

  let scopedFilters;
  const refersOldStyleAttributes = Object.values(filteringAttributes).some(scopeValues => scopeValues.some(scopedValue => queryParams.get(scopedValue)));
  if (refersOldStyleAttributes && !Object.keys(scopes).some(scope => queryParams.get(scope))) {
    const { filters, params } = legacyDeviceQueryParse(queryParams, filteringAttributes);
    scopedFilters = filters;
    queryParams = params;
  } else {
    const { filters, params } = scopedFilterParse(queryParams);
    scopedFilters = filters;
    queryParams = params;
  }

  let groupName = '';
  const groupFilterIndex = scopedFilters.inventory.findIndex(filter => filter.key === 'group' && filter.operator === DEVICE_FILTERING_OPTIONS.$eq.key);
  if (groupFilterIndex > -1) {
    groupName = scopedFilters.inventory[groupFilterIndex].value;
    scopedFilters.inventory.splice(groupFilterIndex, 1);
  }
  return { filters: Object.values(scopedFilters).flat(), groupName };
};

const formatSorting = (sort, { sort: sortDefault }) => {
  if (!sort || deepCompare(sort, sortDefault)) {
    return '';
  }
  const sortQuery = ['scope', 'key', 'direction']
    .reduce((accu, key) => {
      if (!sort[key]) {
        return accu;
      }
      accu.push(sort[key]);
      return accu;
    }, [])
    .join(SEPARATOR);
  return `sort=${sortQuery}`;
};

export const formatPageState = ({ selectedId, selectedIssues, page, perPage, sort }, { defaults }) =>
  Object.entries({ page, perPage, id: selectedId, issues: selectedIssues, open: selectedId ? true : undefined })
    .reduce(
      (accu, [key, value]) => {
        if (Array.isArray(value)) {
          accu.push(...value.map(item => `${key}=${encodeURIComponent(item)}`));
        } else if ((DEVICE_LIST_DEFAULTS[key] != value || !DEVICE_LIST_DEFAULTS.hasOwnProperty(key)) && value) {
          accu.push(`${key}=${encodeURIComponent(value)}`);
        }
        return accu;
      },
      [formatSorting(sort, defaults)]
    )
    .filter(i => i)
    .join('&');

const stripFilterOperator = operator => operator.replaceAll('$', '');

const formatFilters = filters => {
  const result = filters
    // group all filters by their scope to get a more organized result
    .reduce(
      (accu, filter) => {
        const { scope = ATTRIBUTE_SCOPES.inventory, operator = '$eq' } = filter;
        accu[scope].add(`${scopes[scope].delimiter}=${filter.key}${SEPARATOR}${stripFilterOperator(operator)}${SEPARATOR}${encodeURIComponent(filter.value)}`);
        return accu;
      },
      Object.keys(scopes).reduce((accu, item) => ({ ...accu, [item]: new Set() }), {})
    );
  // boil it all down to a single line containing all filters
  return Object.values(result)
    .map(filterSet => [...filterSet])
    .flat();
};

export const formatDeviceSearch = ({ filters, selectedGroup }) => {
  let activeFilters = [...filters];
  if (selectedGroup) {
    const isUngroupedGroup = selectedGroup === UNGROUPED_GROUP.id;
    activeFilters = isUngroupedGroup
      ? activeFilters.filter(
          filter => !(filter.key === 'group' && filter.scope === ATTRIBUTE_SCOPES.system && filter.operator === DEVICE_FILTERING_OPTIONS.$nin.key)
        )
      : activeFilters;
    const groupName = isUngroupedGroup ? UNGROUPED_GROUP.name : selectedGroup;
    activeFilters.push({ scope: ATTRIBUTE_SCOPES.inventory, key: 'group', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: groupName });
  }

  return formatFilters(activeFilters)
    .filter(i => i)
    .join('&');
};

export const generateDevicePath = ({ pageState }) => {
  const { state: selectedState } = pageState;
  const path = ['/devices'];
  if (![routes.allDevices.key, ''].includes(selectedState)) {
    path.push(selectedState);
  }
  return path.join('/');
};

const formatDates = ({ endDate, params, startDate, today, tonight }) => {
  if (endDate && endDate !== tonight) {
    params.set('endDate', new Date(endDate).toISOString().split('T')[0]);
  }
  if (startDate && startDate !== today) {
    params.set('startDate', new Date(startDate).toISOString().split('T')[0]);
  }
  return params;
};

const paramReducer = (accu, [key, value]) => {
  if (value) {
    accu.set(key, value);
  }
  return accu;
};

export const formatAuditlogs = ({ pageState }, { today, tonight }) => {
  const { detail, endDate, startDate, type, user = {} } = pageState;
  let params = new URLSearchParams();
  params = Object.entries({ objectId: detail, userId: user.id }).reduce(paramReducer, params);
  if (type) {
    params.set('objectType', type.value);
  }
  params = formatDates({ endDate, params, startDate, today, tonight });
  return params.toString();
};

const parseDateParams = (params, today, tonight) => {
  let endDate = tonight;
  if (params.get('endDate')) {
    const date = new Date(params.get('endDate'));
    date.setHours(23, 59, 59, 999);
    endDate = date.toISOString();
  }
  let startDate = today;
  if (params.get('startDate')) {
    const date = new Date(params.get('startDate'));
    date.setHours(0, 0, 0, 0);
    startDate = date.toISOString();
  }
  return { endDate, startDate };
};

export const parseAuditlogsQuery = (params, { today, tonight }) => {
  const type = AUDIT_LOGS_TYPES.find(typeObject => typeObject.value === params.get('objectType')) || '';
  const { endDate, startDate } = parseDateParams(params, today, tonight);
  return {
    detail: params.get('objectId') || '',
    endDate,
    startDate,
    type,
    user: params.get('userId') || ''
  };
};