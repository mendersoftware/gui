import React from 'react';
import { connect } from 'react-redux';

import { getDevicesByStatus } from '../../../actions/deviceActions';
import * as DeviceConstants from '../../../constants/deviceConstants';

import Loader from '../../common/loader';
import DeviceList from '../devicelist';

export class GroupDeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedRows: [],
      pageNo: 1,
      pageLength: 10
    };
  }

  _getDevices() {
    var self = this;
    return self.props
      .getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength)
      .catch(err => {
        console.log(err.error || 'Please check your connection.');
      })
      .finally(() => self.setState({ loading: false, pageLoading: false }));
  }

  _loadMoreDevs() {
    var self = this;
    var numberDevs = self.state.pageLength + 10;
    self.setState({ pageLength: numberDevs }, () =>
      self.props.devices.length < self.state.pageLength && self.props.devices.length < self.props.acceptedCount ? self._getDevices() : null
    );
  }

  onRowSelection(selection) {
    this.setState({ selectedRows: selection });
    const devices = this.props.devices;
    const selectedDevices = selection.map(index => devices[index]);
    this.props.onDeviceSelection(selectedDevices);
  }

  render() {
    const self = this;
    const { acceptedCount, globalSettings, loadingDevices, selectedDevices } = self.props;
    const { pageLength, selectedRows } = self.state;
    const devices = this.props.devices.length ? this.props.devices.slice(0, pageLength) : selectedDevices;
    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        style: { flexGrow: 1 }
      },
      {
        title: 'Device type',
        name: 'device_type',
        render: device => (device.attributes && device.attributes.device_type ? device.attributes.device_type : '-')
      }
    ];
    return (
      <div className="dialogTableContainer">
        {!!devices.length && (
          <DeviceList
            columnHeaders={columnHeaders}
            devices={devices}
            expandable={false}
            onSelect={selection => self.onRowSelection(selection)}
            pageNo={1}
            pageLength={pageLength}
            pageTotal={pageLength}
            selectedRows={selectedRows}
            showPagination={false}
          />
        )}
        {acceptedCount > devices.length ? (
          <a className="small" onClick={() => this._loadMoreDevs()}>
            Load more devices
          </a>
        ) : null}
        <Loader show={loadingDevices} />
        <p className={devices.length || loadingDevices ? 'hidden' : 'italic muted'}>No devices match the search term</p>
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus };

const mapStateToProps = state => {
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    devices: state.devices.byStatus.accepted.deviceIds,
    globalSettings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(GroupDeviceList);
