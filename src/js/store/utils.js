import { duplicateFilter, yes } from '../helpers';
import { DEVICE_FILTERING_OPTIONS, DEVICE_ISSUE_OPTIONS, DEVICE_LIST_MAXIMUM_LENGTH, emptyUiPermissions } from './commonConstants';

// for some reason these functions can not be stored in the deviceConstants...
const filterProcessors = {
  $gt: val => Number(val) || val,
  $gte: val => Number(val) || val,
  $lt: val => Number(val) || val,
  $lte: val => Number(val) || val,
  $in: val => ('' + val).split(',').map(i => i.trim()),
  $nin: val => ('' + val).split(',').map(i => i.trim()),
  $exists: yes,
  $nexists: () => false
};
const filterAliases = {
  $nexists: { alias: DEVICE_FILTERING_OPTIONS.$exists.key, value: false }
};
export const mapFiltersToTerms = filters =>
  filters.map(filter => ({
    scope: filter.scope,
    attribute: filter.key,
    type: filterAliases[filter.operator]?.alias || filter.operator,
    value: filterProcessors.hasOwnProperty(filter.operator) ? filterProcessors[filter.operator](filter.value) : filter.value
  }));
export const mapTermsToFilters = terms =>
  terms.map(term => {
    const aliasedFilter = Object.entries(filterAliases).find(
      aliasDefinition => aliasDefinition[1].alias === term.type && aliasDefinition[1].value === term.value
    );
    const operator = aliasedFilter ? aliasedFilter[0] : term.type;
    return { scope: term.scope, key: term.attribute, operator, value: term.value };
  });

const convertIssueOptionsToFilters = (issuesSelection, filtersState = {}) =>
  issuesSelection.map(item => {
    if (typeof DEVICE_ISSUE_OPTIONS[item].filterRule.value === 'function') {
      return { ...DEVICE_ISSUE_OPTIONS[item].filterRule, value: DEVICE_ISSUE_OPTIONS[item].filterRule.value(filtersState) };
    }
    return DEVICE_ISSUE_OPTIONS[item].filterRule;
  });

export const convertDeviceListStateToFilters = ({ filters = [], group, groups = { byId: {} }, offlineThreshold, selectedIssues = [], status }) => {
  let applicableFilters = [...filters];
  if (typeof group === 'string' && !(groups.byId[group]?.filters || applicableFilters).length) {
    applicableFilters.push({ key: 'group', value: group, operator: DEVICE_FILTERING_OPTIONS.$eq.key, scope: 'system' });
  }
  const nonMonitorFilters = applicableFilters.filter(
    filter =>
      !Object.values(DEVICE_ISSUE_OPTIONS).some(
        ({ filterRule }) => filter.scope !== 'inventory' && filterRule.scope === filter.scope && filterRule.key === filter.key
      )
  );
  const deviceIssueFilters = convertIssueOptionsToFilters(selectedIssues, { offlineThreshold });
  applicableFilters = [...nonMonitorFilters, ...deviceIssueFilters];
  const effectiveFilters = status
    ? [...applicableFilters, { key: 'status', value: status, operator: DEVICE_FILTERING_OPTIONS.$eq.key, scope: 'identity' }]
    : applicableFilters;
  return { applicableFilters: nonMonitorFilters, filterTerms: mapFiltersToTerms(effectiveFilters) };
};

export const listItemMapper = (byId, ids, { defaultObject = {}, cutOffSize = DEVICE_LIST_MAXIMUM_LENGTH }) => {
  return ids.slice(0, cutOffSize).reduce((accu, id) => {
    if (id && byId[id]) {
      accu.push({ ...defaultObject, ...byId[id] });
    }
    return accu;
  }, []);
};

const mergePermissions = (existingPermissions = { ...emptyUiPermissions }, addedPermissions) =>
  Object.entries(existingPermissions).reduce(
    (accu, [key, value]) => {
      let values;
      if (!accu[key]) {
        accu[key] = value;
        return accu;
      }
      if (Array.isArray(value)) {
        values = [...value, ...accu[key]].filter(duplicateFilter);
      } else {
        values = mergePermissions(accu[key], { ...value });
      }
      accu[key] = values;
      return accu;
    },
    { ...addedPermissions }
  );

export const mapUserRolesToUiPermissions = (userRoles, roles) =>
  userRoles.reduce(
    (accu, roleId) => {
      if (!(roleId && roles[roleId])) {
        return accu;
      }
      return mergePermissions(accu, roles[roleId].uiPermissions);
    },
    { ...emptyUiPermissions }
  );

export const progress = ({ loaded, total }) => {
  let uploadProgress = (loaded / total) * 100;
  return (uploadProgress = uploadProgress < 50 ? Math.ceil(uploadProgress) : Math.round(uploadProgress));
};
