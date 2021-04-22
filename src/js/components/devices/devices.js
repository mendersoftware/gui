import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { getAllDeviceCounts, getDeviceAttributes, selectDevice, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { getUserRoles } from '../../selectors';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Global from '../settings/global';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';
import { emptyFilter } from './filters';

const routes = {
  devices: {
    component: DeviceGroups,
    groupRestricted: false,
    route: '/devices',
    title: () => 'Device groups'
  },
  [DEVICE_STATES.pending]: {
    component: PendingDevices,
    groupRestricted: true,
    route: '/devices/pending',
    title: count => `Pending${count ? ` (${count})` : ''}`
  },
  [DEVICE_STATES.preauth]: {
    component: PreauthDevices,
    groupRestricted: true,
    route: '/devices/preauthorized',
    title: () => 'Preauthorized'
  },
  [DEVICE_STATES.rejected]: {
    component: RejectedDevices,
    groupRestricted: true,
    route: '/devices/rejected',
    title: () => 'Rejected'
  }
};

export const refreshLength = 10000;

export const convertQueryToFilterAndGroup = (query, filteringAttributes) => {
  const search = query.startsWith('?') ? query.substring(1) : query;
  const str = decodeURIComponent(search);
  const filters = str.split('&').reduce(
    (accu, filter) => {
      const filterPair = filter.split('=');
      let scope = {};
      if (filterPair[0] === 'group') {
        accu.groupName = filterPair[1];
        return accu;
      } else if (filterPair[0] === 'id') {
        scope = { scope: 'identity' };
      } else {
        scope = Object.entries(filteringAttributes).reduce(
          (accu, [attributesType, attributes]) => {
            if (attributes.includes(filterPair[0])) {
              accu.scope = attributesType.substring(0, attributesType.indexOf('Attr'));
            }
            return accu;
          },
          { scope: emptyFilter.scope }
        );
      }
      accu.filters.push({ ...emptyFilter, ...scope, key: filterPair[0], value: filterPair[1] });
      return accu;
    },
    { filters: [], groupName: '' }
  );
  return filters;
};

export class Devices extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      openIdDialog: false
    };
  }

  componentDidMount() {
    const { filteringAttributes, getDeviceAttributes, location, match, selectGroup, setDeviceFilters, setSnackbar } = this.props;
    clearAllRetryTimers(setSnackbar);
    this._restartInterval();
    const query = match.params.filters || location.search;
    if (query) {
      const queryResult = convertQueryToFilterAndGroup(query, filteringAttributes);
      this.updateDeviceSelection(queryResult, selectGroup, setDeviceFilters);
    }
    getDeviceAttributes();
  }

  componentDidUpdate(prevProps) {
    const { filteringAttributes, groups, location, selectGroup, setDeviceFilters } = this.props;
    if (
      location.search &&
      ((!Object.values(prevProps.filteringAttributes)
        .flat()
        .some(attribute => attribute) &&
        Object.values(filteringAttributes)
          .flat()
          .some(attribute => attribute)) ||
        prevProps.groups.length !== groups.length)
    ) {
      const queryResult = convertQueryToFilterAndGroup(location.search, filteringAttributes);
      this.updateDeviceSelection(queryResult, selectGroup, setDeviceFilters);
    }
  }

  componentWillUnmount() {
    clearAllRetryTimers(this.props.setSnackbar);
    clearInterval(this.interval);
  }

  updateDeviceSelection(queryResult, selectGroup, setDeviceFilters) {
    const { filters, groupName } = queryResult;
    if (groupName) {
      selectGroup(groupName, filters);
    } else {
      setDeviceFilters(filters);
    }
  }

  _restartInterval() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(() => self.props.getAllDeviceCounts(), refreshLength);
    self.props.getAllDeviceCounts();
  }

  _openSettingsDialog(e) {
    e.preventDefault();
    this.setState({ openIdDialog: !this.state.openIdDialog });
  }

  render() {
    const { history, isGroupRestricted, match, pendingCount, setSnackbar } = this.props;
    const { openIdDialog } = this.state;

    let tabIndex = match.params.status || 'devices';
    if (isGroupRestricted) {
      tabIndex = routes[tabIndex].groupRestricted ? 'devices' : tabIndex;
    }
    const ComponentToShow = routes[tabIndex].component;
    return (
      <>
        <Tabs value={tabIndex} onChange={() => setSnackbar('')}>
          {Object.entries(routes).reduce((accu, [key, route]) => {
            if (!isGroupRestricted || !route.groupRestricted) {
              accu.push(<Tab component={Link} key={key} label={route.title(pendingCount)} value={key} to={route.route} />);
            }
            return accu;
          }, [])}
        </Tabs>
        <ComponentToShow
          history={history}
          openSettingsDialog={e => this._openSettingsDialog(e)}
          params={match.params}
          restart={() => this._restartInterval()}
        />
        {openIdDialog && (
          <Dialog open={true}>
            <DialogTitle>Default device identity attribute</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              <Global dialog={true} closeDialog={e => this._openSettingsDialog(e)} />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
}

const actionCreators = { getAllDeviceCounts, getDeviceAttributes, selectDevice, selectGroup, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  const { isGroupRestricted } = getUserRoles(state);
  return {
    filteringAttributes: state.devices.filteringAttributes,
    groups: Object.keys(state.devices.groups.byId),
    isGroupRestricted,
    pendingCount: state.devices.byStatus.pending.total
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Devices));
