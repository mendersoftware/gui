module.exports = {
  SELECT_GROUP: 'SELECT_GROUP',
  SELECT_DEVICE: 'SELECT_DEVICE',

  ADD_TO_GROUP: 'ADD_TO_GROUP',
  ADD_DYNAMIC_GROUP: 'ADD_DYNAMIC_GROUP',
  ADD_STATIC_GROUP: 'ADD_STATIC_GROUP',
  REMOVE_DYNAMIC_GROUP: 'REMOVE_DYNAMIC_GROUP',
  REMOVE_STATIC_GROUP: 'REMOVE_STATIC_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
  RECEIVE_GROUPS: 'RECEIVE_GROUPS',
  RECEIVE_DYNAMIC_GROUPS: 'RECEIVE_DYNAMIC_GROUPS',
  RECEIVE_DEVICE: 'RECEIVE_DEVICE',
  RECEIVE_DEVICES: 'RECEIVE_DEVICES',
  RECEIVE_DEVICE_AUTH: 'RECEIVE_DEVICE_AUTH',
  RECEIVE_DEVICE_CONFIG: 'RECEIVE_DEVICE_CONFIG',
  RECEIVE_DEVICE_CONNECT: 'RECEIVE_DEVICE_CONNECT',
  RECEIVE_GROUP_DEVICES: 'RECEIVE_GROUP_DEVICES',
  SET_TOTAL_DEVICES: 'SET_TOTAL_DEVICES',
  SET_ACCEPTED_DEVICES_COUNT: 'SET_ACCEPTED_DEVICES_COUNT',
  SET_PENDING_DEVICES_COUNT: 'SET_PENDING_DEVICES_COUNT',
  SET_REJECTED_DEVICES_COUNT: 'SET_REJECTED_DEVICES_COUNT',
  SET_PREAUTHORIZED_DEVICES_COUNT: 'SET_PREAUTHORIZED_DEVICES_COUNT',
  SET_FILTER_ATTRIBUTES: 'SET_FILTER_ATTRIBUTES',
  SET_DEVICE_FILTERS: 'SET_DEVICE_FILTERS',

  SET_ACCEPTED_DEVICES: 'SET_ACCEPTED_DEVICES',
  SET_PENDING_DEVICES: 'SET_PENDING_DEVICES',
  SET_REJECTED_DEVICES: 'SET_REJECTED_DEVICES',
  SET_PREAUTHORIZED_DEVICES: 'SET_PREAUTHORIZED_DEVICES',

  SET_INACTIVE_DEVICES: 'SET_INACTIVE_DEVICES',
  SET_DEVICE_LIST_STATE: 'SET_DEVICE_LIST_STATE',

  SET_DEVICE_LIMIT: 'SET_DEVICE_LIMIT',

  // see https://github.com/mendersoftware/go-lib-micro/tree/master/ws
  //     for the description of proto_header and the consts
  // *Note*: this needs to be aligned with mender-connect and deviceconnect.
  DEVICE_MESSAGE_PROTOCOLS: {
    Shell: 1
  },
  DEVICE_MESSAGE_TYPES: {
    Delay: 'delay',
    New: 'new',
    Ping: 'ping',
    Pong: 'pong',
    Resize: 'resize',
    Shell: 'shell',
    Stop: 'stop'
  },
  DEVICE_LIST_DEFAULTS: {
    page: 1,
    perPage: 20
  },
  DEVICE_LIST_MAXIMUM_LENGTH: 50,
  DEVICE_FILTERING_OPTIONS: {
    $eq: { title: 'equals', shortform: '=' },
    $ne: { title: 'not equal', shortform: '!=' },
    $gt: {
      title: '>',
      shortform: '>',
      help:
        'The "greater than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
    },
    $gte: {
      title: '>=',
      shortform: '>=',
      help:
        'The "greater than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
    },
    $lt: {
      title: '<',
      shortform: '<',
      help:
        'The "lesser than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
    },
    $lte: {
      title: '<=',
      shortform: '<=',
      help:
        'The "lesser than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
    },
    $in: {
      title: 'in',
      shortform: 'in',
      help: 'The "in" operator accepts a list of comma-separated values. It matches if the selected field is equal to one of the specified values.'
    },
    $nin: {
      title: 'not in',
      shortform: 'not in',
      help: `The "not in" operator accepts a list of comma-separated values. It matches if the selected field's value is not equal to any of the specified options.`
    },
    $exists: {
      title: 'exists',
      shortform: 'exists',
      value: true,
      help: `The "exists" operator matches if the selected field's value has a value. No value needs to be provided for this operator.`
    },
    $nexists: {
      title: `doesn't exist`,
      shortform: `doesn't exist`,
      value: true,
      help: `The "doesn't exist" operator matches if the selected field's value has no value. No value needs to be provided for this operator.`
    },
    $regex: {
      title: `matches regular expression`,
      shortform: `matches`,
      help: `The "regular expression" operator matches the selected field's value with a Perl compatible regular expression (PCRE), automatically anchored by ^. If the regular expression is not valid, the filter will produce no results. If you need to specify options and flags, you can provide the full regex in the format of /regex/flags, for example.`
    }
  },
  DEVICE_ISSUE_OPTIONS: {
    offline: {
      key: 'offline',
      needsReporting: true,
      filterRule: {
        scope: 'system',
        key: 'updated_ts',
        operator: '$lt',
        value: () => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString();
        }
      },
      title: 'Offline devices'
    },
    monitoring: {
      key: 'monitoring',
      needsReporting: false,
      filterRule: { scope: 'monitor', key: 'alerts', operator: '$eq', value: true },
      title: 'Devices reporting monitoring issues'
    },
    authRequests: {
      key: 'authRequests',
      needsReporting: true,
      filterRule: { scope: 'monitor', key: 'auth_requests', operator: '$gt', value: 1 },
      title: 'Devices with new authentication requests'
    }
  },
  DEVICE_SORTING_OPTIONS: {
    asc: 'asc',
    desc: 'desc'
  },
  // we can't include the dismiss state with the rest since this would include dismissed devices in several queries
  DEVICE_DISMISSAL_STATE: 'dismiss',
  DEVICE_STATES: {
    accepted: 'accepted',
    pending: 'pending',
    preauth: 'preauthorized',
    rejected: 'rejected'
  },
  DEVICE_CONNECT_STATES: {
    connected: 'connected',
    disconnected: 'disconnected',
    unknown: 'unknown'
  },
  DEVICE_ONLINE_CUTOFF: { interval: 24, intervalName: 'hour' },
  ATTRIBUTE_SCOPES: {
    inventory: 'inventory',
    identity: 'identity',
    monitor: 'monitor',
    system: 'system',
    tags: 'tags'
  },
  UNGROUPED_GROUP: { id: '*|=ungrouped=|*', name: 'Unassigned' }
};
