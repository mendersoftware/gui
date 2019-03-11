import React from 'react';
import Time from 'react-time';
import { Collapse } from 'react-collapse';
import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import ExpandedDevice from './expanded-device';

import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

export default class Rejected extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      divHeight: 178,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      authLoading: 'all'
    };
  }

  componentDidMount() {
    clearAllRetryTimers();
    this._getDevices();
  }

  componentWillUnmount() {
    clearAllRetryTimers();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Rejected'))) {
      this._getDevices();
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('rejected', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, pageLoading: false, authLoading: null, expandRow: null });
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
      })
      .catch(error => {
        console.log(error);
        var errormsg = error.error || 'Please check your connection.';
        self.setState({ pageLoading: false, authLoading: null });
        setRetryTimer(error, 'devices', `Rejected devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
      });
  }
  _sortColumn(col) {
    console.log(`sort: ${col}`);
  }
  _expandRow(rowNumber) {
    AppActions.setSnackbar('');
    var device = this.state.devices[rowNumber];
    if (this.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    this.setState({ expandedDevice: device, expandRow: rowNumber });
  }
  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 95 });
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  render() {
    var self = this;
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;

    var devices = this.state.devices.map((device, index) => {
      var id_attribute =
        self.props.globalSettings && self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== 'Device ID'
          ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
          : device.id;

      var expanded = '';
      if (self.state.expandRow === index) {
        expanded = (
          <ExpandedDevice
            id_attribute={(self.props.globalSettings || {}).id_attribute}
            _showKey={self._showKey}
            showKey={self.state.showKey}
            limitMaxed={limitMaxed}
            deviceId={self.state.deviceId}
            id_value={id_attribute}
            device={self.state.expandedDevice}
            unauthorized={true}
            pause={self.props.pause}
          />
        );
      }

      return (
        <TableRow
          className={expanded ? 'expand' : null}
          hover
          key={index}
          onClick={() => self._expandRow(index)}
          style={expanded ? { height: self.state.divHeight } : null}
        >
          <TableCell>{id_attribute}</TableCell>
          <TableCell>
            <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell>
            <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell className="capitalized">{device.status}</TableCell>
          <TableCell style={{ width: '55px', paddingRight: '0', paddingLeft: '12px' }} className="expandButton">
            <IconButton className="float-right">
              <Icon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
            </IconButton>
          </TableCell>
          <TableCell style={{ width: '0', padding: '0', overflow: 'visible' }}>
            <Collapse
              springConfig={{ stiffness: 210, damping: 20 }}
              onMeasure={measurements => self._adjustCellHeight(measurements.height)}
              className="expanded"
              isOpened={expanded ? true : false}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {expanded}
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }, this);

    return (
      <div>
        <Loader show={this.state.authLoading === 'all'} />

        {this.state.devices.length && this.state.authLoading !== 'all' ? (
          <div className="padding-bottom">
            <h3 className="align-center">Rejected devices</h3>

            <Table>
              <TableHead className="clickable">
                <TableRow>
                  <TableCell className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                    {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
                    <Icon onClick={this.props.openSettingsDialog} style={{ fontSize: '16px' }} className="material-icons hover float-right">
                      settings
                    </Icon>
                  </TableCell>
                  <TableCell className="columnHeader" tooltip="First request">
                    First request
                  </TableCell>
                  <TableCell className="columnHeader" tooltip="Last updated">
                    Last updated
                  </TableCell>
                  <TableCell className="columnHeader" tooltip="Status">
                    Status
                  </TableCell>
                  <TableCell className="columnHeader" style={{ width: '55px', paddingRight: '12px', paddingLeft: '0' }} />
                </TableRow>
              </TableHead>
              <TableBody className="clickable">{devices}</TableBody>
            </Table>

            <div className="margin-top">
              <Pagination
                locale={_en_US}
                simple
                pageSize={this.state.pageLength}
                current={this.state.pageNo || 1}
                total={this.props.count}
                onChange={page => this._handlePageChange(page)}
              />
              {this.state.pageLoading ? (
                <div className="smallLoaderContainer">
                  <Loader show={true} />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={this.state.authLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>There are no rejected devices</p>
          </div>
        )}
      </div>
    );
  }
}
