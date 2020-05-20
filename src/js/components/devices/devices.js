import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { getAllDeviceCounts, selectDevice, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
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

export class Devices extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      openIdDialog: false
    };
  }

  componentDidMount() {
    clearAllRetryTimers(this.props.setSnackbar);
    this._restartInterval();
    this.props.getAllDeviceCounts();
    if (this.props.match.params.filters) {
      const str = decodeURIComponent(this.props.match.params.filters);
      const filters = str.split('&').map(filter => {
        const filterPair = filter.split('=');
        const scope = filterPair[0] === 'group' ? { scope: 'system' } : {};
        return { ...emptyFilter, ...scope, key: filterPair[0], value: filterPair[1] };
      });
      const groupFilter = filters.find(filter => filter.key === 'group');
      if (groupFilter) {
        this.props.selectGroup(groupFilter.value);
      }
      this.props.setDeviceFilters(filters);
    }
  }

  componentWillUnmount() {
    clearAllRetryTimers(this.props.setSnackbar);
    clearInterval(this.interval);
  }

  _restartInterval() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(() => self.props.getAllDeviceCounts(), refreshLength);
    self.props.getAllDeviceCounts();
  }

  _openSettingsDialog() {
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
      <div>
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
          openSettingsDialog={() => this._openSettingsDialog()}
          params={match.params}
          restart={() => this._restartInterval()}
        />
        {openIdDialog && (
          <Dialog open={openIdDialog || false}>
            <DialogTitle>Default device identity attribute</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              <Global dialog={true} closeDialog={() => this._openSettingsDialog()} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }
}

const actionCreators = { getAllDeviceCounts, selectDevice, selectGroup, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  const currentUser = state.users.byId[state.users.currentUser];
  let isGroupRestricted = false;
  if (currentUser?.roles) {
    // TODO: move these + additional role checks into selectors
    const isAdmin = currentUser.roles.some(role => role === 'RBAC_ROLE_PERMIT_ALL');
    isGroupRestricted =
      !isAdmin && currentUser.roles.some(role => state.users.rolesById[role]?.permissions.some(permission => permission.object.type === 'DEVICE_GROUP'));
  }
  return {
    isGroupRestricted,
    pendingCount: state.devices.byStatus.pending.total
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Devices));
