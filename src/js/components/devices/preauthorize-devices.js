import React from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import { getDeviceCount, getDevicesByStatus, preauthDevice, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { preformatWithRequestID } from '../../helpers';
import Loader from '../common/loader';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import PreauthDialog from './preauth-dialog';

export class Preauthorize extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1,
      pageLength: 20,
      pageLoading: true,
      openPreauth: false,
      public: '',
      devicesToRemove: []
    };
  }

  componentDidMount() {
    this.props.selectGroup();
    this.props.setDeviceFilters([]);
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count) {
      this._getDevices();
    }
    const self = this;
    if (!self.state.pageLoading && !self.props.devices.length && self.props.count) {
      //if devices empty but count not, put back to first page
      self._handlePageChange(1);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      !this.props.devices.every((device, index) => device === nextProps.devices[index]) ||
      this.props.globalSettings.id_attribute !== nextProps.globalSettings.id_attribute ||
      true
    );
  }

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false) {
    var self = this;
    Promise.all([
      self.props.getDevicesByStatus(DEVICE_STATES.preauth, this.state.pageNo, this.state.pageLength, shouldUpdate),
      self.props.getDeviceCount(DEVICE_STATES.preauth)
    ])
      .catch(error => {
        console.log(error);
        var errormsg = error.res.body.error || 'Please check your connection.';
        self.props.setSnackbar(preformatWithRequestID(error.res, `Preauthorized devices couldn't be loaded. ${errormsg}`), null, 'Copy to clipboard');
        console.log(errormsg);
      })
      .finally(() => self.setState({ pageLoading: false }));
  }

  _sortColumn() {
    console.log('sort');
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => self._getDevices(true));
  }

  _togglePreauth(openPreauth = !this.state.openPreauth) {
    this.setState({ openPreauth });
  }

  _savePreauth(authset, close) {
    var self = this;
    self.props
      .preauthDevice(authset)
      .then(() => {
        self._getDevices(true);
        self.setState({ openPreauth: !close });
      })
      .catch(errortext => {
        if (errortext) {
          self.setState({ errortext });
        }
      });
  }

  render() {
    const self = this;
    const { acceptedDevices, count, deviceLimit, devices, globalSettings, openSettingsDialog } = self.props;
    const { errorMessage, openPreauth, pageLoading } = self.state;
    const limitMaxed = deviceLimit && deviceLimit <= acceptedDevices;

    const columnHeaders = [
      {
        title: globalSettings.id_attribute || 'Device ID',
        name: 'device_id',
        customize: openSettingsDialog,
        style: { flexGrow: 1 }
      },
      {
        title: 'Date added',
        name: 'date_added',
        render: device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-')
      },
      {
        title: 'Status',
        name: 'status',
        render: device => (device.status ? <div className="capitalized">{device.status}</div> : '-')
      }
    ];

    const deviceLimitWarning = limitMaxed ? (
      <p className="warning">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        You have reached your limit of authorized devices: {acceptedDevices} of {deviceLimit}
      </p>
    ) : null;

    return (
      <div className="tab-container">
        <div className="flexbox space-between" style={{ zIndex: 2, marginBottom: -1 }}>
          {count ? <h2 className="margin-right">Preauthorized devices</h2> : <div />}
          <div className="flexbox centered">
            <Button color="secondary" variant="contained" disabled={!!limitMaxed} onClick={() => this._togglePreauth(true)}>
              Preauthorize devices
            </Button>
          </div>
        </div>
        {deviceLimitWarning}
        <Loader show={pageLoading} />
        {devices.length && !pageLoading ? (
          <div className="padding-bottom">
            <DeviceList
              {...self.props}
              {...self.state}
              columnHeaders={columnHeaders}
              onPageChange={e => self._handlePageChange(e)}
              onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength }, () => self._handlePageChange(1))}
              pageTotal={count}
              refreshDevices={shouldUpdate => self._getDevices(shouldUpdate)}
            />
          </div>
        ) : (
          <div className={pageLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no preauthorized devices.</p>
            <p>
              {limitMaxed ? 'Preauthorize devices' : <a onClick={() => self._togglePreauth(true)}>Preauthorize devices</a>} so that when they come online, they
              will connect to the server immediately
            </p>
            <img src="assets/img/preauthorize.png" alt="preauthorize" />
          </div>
        )}
        {openPreauth && (
          <PreauthDialog
            deviceLimitWarning={deviceLimitWarning}
            errortext={errorMessage}
            limitMaxed={limitMaxed}
            onSubmit={(data, addMore) => self._savePreauth(data, addMore)}
            onCancel={() => self._togglePreauth(false)}
            onChange={() => self.setState({ errorMessage: null })}
          />
        )}
      </div>
    );
  }
}

const actionCreators = { getDeviceCount, getDevicesByStatus, preauthDevice, selectGroup, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.preauthorized.total,
    devices: state.devices.selectedDeviceList,
    deviceLimit: state.devices.limit,
    globalSettings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Preauthorize);
