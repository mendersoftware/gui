import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import preauthImage from '../../../assets/img/preauthorize.png';
import { setSnackbar } from '../../actions/appActions';
import { getDevicesByStatus, preauthDevice, selectGroup, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import DeviceList from './devicelist';
import { refreshLength as refreshDeviceLength } from './devices';
import PreauthDialog from './preauth-dialog';
import { getIdAttribute, getLimitMaxed } from '../../selectors';
import BaseDevices, { DeviceCreationTime, DeviceExpansion, DeviceStatusHeading } from './base-devices';

const defaultHeaders = [
  {
    title: 'Date added',
    attribute: { name: 'created_ts', scope: 'system' },
    render: DeviceCreationTime,
    sortable: true
  },
  {
    title: 'Status',
    attribute: { name: 'status', scope: 'identity' },
    render: DeviceStatusHeading,
    sortable: true
  },
  {
    title: '',
    attribute: {},
    render: DeviceExpansion,
    sortable: false
  }
];

export class Preauthorize extends BaseDevices {
  constructor(props, context) {
    super(props, context);
    this.state = {
      openPreauth: false,
      pageNo: 1,
      pageLength: 20,
      pageLoading: true,
      sortCol: null,
      sortDown: true,
      sortScope: null
    };
  }

  componentDidMount() {
    this.props.selectGroup();
    this.props.setDeviceFilters([]);
    this.timer = setInterval(() => this._getDevices(), refreshDeviceLength);
    this._getDevices(true);
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

  /*
   * Devices to show
   */
  _getDevices(shouldUpdate = false) {
    const self = this;
    const { pageNo, pageLength, sortCol, sortDown, sortScope } = self.state;
    const sortBy = sortCol ? [{ attribute: sortCol, order: sortDown ? 'desc' : 'asc', scope: sortScope }] : undefined;
    self.props
      .getDevicesByStatus(DEVICE_STATES.preauth, pageNo, pageLength, shouldUpdate, undefined, sortBy)
      .finally(() => self.setState({ pageLoading: false }));
  }

  _togglePreauth(openPreauth = !this.state.openPreauth) {
    this.setState({ openPreauth });
  }

  onPreauthSaved(addMore) {
    this._getDevices(true);
    this.setState({ openPreauth: !addMore });
  }

  render() {
    const self = this;
    const { acceptedDevices, count, deviceLimit, devices, idAttribute, limitMaxed, openSettingsDialog, preauthDevice, setSnackbar } = self.props;
    const { openPreauth, pageLoading } = self.state;

    const columnHeaders = [
      {
        title: idAttribute,
        customize: openSettingsDialog,
        attribute: { name: idAttribute, scope: 'identity' },
        style: { flexGrow: 1 },
        sortable: true
      },
      ...defaultHeaders
    ];

    const deviceLimitWarning = limitMaxed ? (
      <p className="warning">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        You have reached your limit of authorized devices: {acceptedDevices} of {deviceLimit}
      </p>
    ) : null;

    return (
      <div className="tab-container flexbox column">
        <div className="flexbox allow-overflow space-between" style={{ zIndex: 2, marginBottom: -1 }}>
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
              onSort={attribute => self.onSortChange(attribute)}
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
            <img src={preauthImage} alt="preauthorize" />
          </div>
        )}
        {openPreauth && (
          <PreauthDialog
            deviceLimitWarning={deviceLimitWarning}
            limitMaxed={limitMaxed}
            preauthDevice={preauthDevice}
            onSubmit={addMore => self.onPreauthSaved(addMore)}
            onCancel={() => self._togglePreauth(false)}
            setSnackbar={setSnackbar}
          />
        )}
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus, preauthDevice, selectGroup, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    count: state.devices.byStatus.preauthorized.total,
    devices: state.devices.selectedDeviceList,
    deviceLimit: state.devices.limit,
    idAttribute: getIdAttribute(state),
    limitMaxed: getLimitMaxed(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Preauthorize);
