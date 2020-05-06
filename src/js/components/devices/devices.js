import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { getAllDeviceCounts, selectDevice, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Global from '../settings/global';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';

const routes = {
  pending: {
    route: '/devices/pending',
    status: DEVICE_STATES.pending,
    title: 'Pending'
  },
  preauthorized: {
    route: '/devices/preauthorized',
    status: DEVICE_STATES.preauth,
    title: 'Preauthorized'
  },
  rejected: {
    route: '/devices/rejected',
    status: DEVICE_STATES.rejected,
    title: 'Rejected'
  },
  devices: {
    route: '/devices',
    status: 'devices',
    title: 'Device groups'
  }
};

const refreshLength = 10000;

export class Devices extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentTab: this._getCurrentLabel(),
      tabIndex: this._updateActive()
    };
  }

  componentDidMount() {
    clearAllRetryTimers(this.props.setSnackbar);
    this._restartInterval();
    this.props.getAllDeviceCounts();
    if (this.props.match.params.filters) {
      var str = decodeURIComponent(this.props.match.params.filters);
      const filters = str.split('&').map(filter => {
        const filterPair = filter.split('=');
        return { key: filterPair[0], value: filterPair[1] };
      });
      this.props.setDeviceFilters(filters);
    }
  }

  // nested tabs
  componentDidUpdate() {
    const tabIndex = this._updateActive();
    const currentTab = this._getCurrentLabel();
    if (this.state.tabIndex !== tabIndex || this.state.currentTab !== currentTab) {
      this.setState({ tabIndex, currentTab });
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

  _updateActive(tab = this.props.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.devices.route;
  }

  _getCurrentLabel(tab = this.props.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].title;
    }
    return routes.devices.title;
  }

  _openSettingsDialog() {
    var self = this;
    self.setState({ openIdDialog: !self.state.openIdDialog });
  }

  render() {
    const { match, pendingCount, setSnackbar } = this.props;
    const { currentTab, openIdDialog } = this.state;

    const pendingLabel = pendingCount ? `Pending (${pendingCount})` : 'Pending';
    const tabIndex = match.params.status || 'devices';
    return (
      <div>
        <Tabs value={tabIndex} onChange={() => setSnackbar('')}>
          <Tab component={Link} label={routes.devices.title} value={routes.devices.status} to={routes.devices.route} />
          <Tab component={Link} label={pendingLabel} value={routes.pending.status} to={routes.pending.route} />
          <Tab component={Link} label={routes.preauthorized.title} value={routes.preauthorized.status} to={routes.preauthorized.route} />
          <Tab component={Link} label={routes.rejected.title} value={routes.rejected.status} to={routes.rejected.route} />
        </Tabs>
        {tabIndex === routes.pending.status && (
          <PendingDevices currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} restart={() => this._restartInterval()} />
        )}
        {tabIndex === routes.preauthorized.status && <PreauthDevices currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} />}
        {tabIndex === routes.rejected.status && <RejectedDevices currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} />}
        {tabIndex === routes.devices.status && (
          <DeviceGroups params={match.params} currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} />
        )}

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

const actionCreators = { getAllDeviceCounts, selectDevice, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  return {
    pendingCount: state.devices.byStatus.pending.total
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Devices));
