import React from 'react';
import Time from 'react-time';

import { ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';

import RelativeTime from '../common/relative-time';

export const RelativeDeviceTime = device => <RelativeTime updateTime={device.updated_ts} />;
export const DeviceStatusHeading = device => (device.status ? <div className="capitalized">{device.status}</div> : '-');
export const DeviceCreationTime = device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-');
export const DeviceExpansion = () => (
  <div className="bold flexbox link-color margin-right-small uppercased" style={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
    view details <ArrowRightAltIcon />
  </div>
);

export default class BaseDevices extends React.Component {
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false) {
    console.log(shouldUpdate);
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  onSortChange(attribute) {
    const self = this;
    let state = { sortCol: attribute.name === 'Device ID' ? 'id' : attribute.name, sortDown: !self.state.sortDown, sortScope: attribute.scope };
    if (state.sortCol !== self.state.sortCol && attribute.name !== 'Device ID') {
      state.sortDown = true;
    }
    self.setState(state, () => self._getDevices(true));
  }
}
