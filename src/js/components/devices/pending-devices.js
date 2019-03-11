import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import { AuthDevices, ExpandAuth } from '../helptips/helptooltips';
import { Link } from 'react-router-dom';
import Loader from '../common/loader';
import AppActions from '../../actions/app-actions';
import ExpandedDevice from './expanded-device';

import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';
import pluralize from 'pluralize';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { preformatWithRequestID } from '../../helpers';

// material ui
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import HelpIcon from '@material-ui/icons/Help';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      divHeight: 208,
      devices: [],
      pageNo: 1,
      pageLength: 20,
      selectedRows: [],
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
    if (prevProps.count !== this.props.count || (prevProps.currentTab !== this.props.currentTab && this.props.currentTab.indexOf('Pending') !== -1)) {
      this._getDevices();
      this._clearSelected();
    }

    if (prevProps.currentTab !== this.props.currentTab) {
      this._clearSelected();
    }
  }

  /*
   * Devices to show
   */
  _getDevices() {
    var self = this;
    AppActions.getDevicesByStatus('pending', this.state.pageNo, this.state.pageLength)
      .then(devices => {
        self.setState({ devices, pageLoading: false, authLoading: null, expandRow: null });
        if (!devices.length && self.props.count) {
          //if devices empty but count not, put back to first page
          self._handlePageChange(1);
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection.';
        self.setState({ pageLoading: false, authLoading: null });
        setRetryTimer(err, 'devices', `Pending devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
      });
  }

  _clearSelected() {
    var self = this;
    this.setState({ selectedRows: [], expandRow: null, allRowsSelected: true }, () => {
      // workaround to ensure all rows deselected
      self.setState({ allRowsSelected: false });
    });
  }

  _sortColumn() {
    console.log('sort');
  }
  _expandRow(event, rowNumber) {
    const self = this;
    if (event.target.closest('input') && event.target.closest('input').hasOwnProperty('checked')) {
      return;
    }
    AppActions.setSnackbar('');
    var device = self.state.devices[rowNumber];
    if (self.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    self.setState({ expandedDevice: device, expandRow: rowNumber });
  }
  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 95 });
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ selectedRows: [], currentPage: pageNo, pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  _onRowSelection(selectedRow) {
    const self = this;
    const { selectedRows } = self.state;
    const selectedIndex = selectedRows.indexOf(selectedRow);
    let updatedSelection = [];
    if (selectedIndex === -1) {
      updatedSelection = updatedSelection.concat(selectedRows, selectedRow);
    } else {
      selectedRows.splice(selectedIndex, 1);
      updatedSelection = selectedRows;
    }
    self.setState({ selectedRows: updatedSelection });
  }

  onSelectAllClick() {
    const self = this;
    let selectedRows = Array.apply(null, { length: this.state.devices.length }).map(Number.call, Number);
    if (self.state.selectedRows.length && self.state.selectedRows.length <= self.state.devices.length) {
      selectedRows = [];
    }
    self.setState({ selectedRows });
  }

  _isSelected(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  }

  _getDevicesFromSelectedRows() {
    // use selected rows to get device from corresponding position in devices array
    const self = this;
    const devices = self.state.selectedRows.map(row => self.state.devices[row]);
    return devices;
  }

  _getSnackbarMessage(skipped, done) {
    pluralize.addIrregularRule('its', 'their');
    var skipText = skipped
      ? `${skipped} ${pluralize('devices', skipped)} ${pluralize('have', skipped)} more than one pending authset. Expand ${pluralize(
        'this',
        skipped
      )} ${pluralize('device', skipped)} to individually adjust ${pluralize('their', skipped)} authorization status. `
      : '';
    var doneText = done ? `${done} ${pluralize('device', done)} ${pluralize('was', done)} updated successfully. ` : '';
    AppActions.setSnackbar(doneText + skipText);
  }

  _authorizeDevices() {
    var self = this;
    var devices = this._getDevicesFromSelectedRows();
    self.setState({ authLoading: true });
    var skipped = 0;
    var count = 0;

    // for each device, get id and id of authset & make api call to accept
    // if >1 authset, skip instead
    const deviceAuthUpdates = devices.map(device => {
      if (device.auth_sets.length !== 1) {
        skipped++;
        return Promise.resolve();
      }
      // api call device.id and device.authsets[0].id
      return AppActions.updateDeviceAuth(device.id, device.auth_sets[0].id, 'accepted')
        .then(() => count++)
        .catch(err => {
          var errMsg = err.res.error.message || '';
          console.log(errMsg);
          // break if an error occurs, display status up til this point before error message
          self._getSnackbarMessage(skipped, count);
          setTimeout(() => {
            AppActions.setSnackbar(
              preformatWithRequestID(err.res, `The action was stopped as there was a problem updating a device authorization status: ${errMsg}`),
              null,
              'Copy to clipboard'
            );
            self.setState({ selectedRows: [] });
            self.props.restart();
          }, 4000);
          self.break;
        });
    });
    return Promise.all(deviceAuthUpdates).then(() => {
      self._getSnackbarMessage(skipped, count);
      // refresh devices by calling function in parent
      self.props.restart();
      self.setState({ selectedRows: [] });
    });
  }

  render() {
    const self = this;
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;
    var limitNear = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.devices.length : false;
    var selectedOverLimit = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.selectedRows.length : false;

    var devices = this.state.devices.map(function(device, index) {
      var expanded = '';

      var id_attribute =
        self.props.globalSettings.id_attribute && self.props.globalSettings.id_attribute !== 'Device ID'
          ? (device.identity_data || {})[self.props.globalSettings.id_attribute]
          : device.id;

      if (self.state.expandRow === index) {
        expanded = (
          <ExpandedDevice
            highlightHelp={self.props.highlightHelp}
            showHelptips={self.props.showHelptips}
            id_attribute={(self.props.globalSettings || {}).id_attribute}
            id_value={id_attribute}
            _showKey={self._showKey}
            showKey={self.state.showKey}
            limitMaxed={limitMaxed}
            deviceId={self.state.deviceId}
            device={self.state.expandedDevice}
            unauthorized={true}
            pause={self.props.pause}
          />
        );
      }

      return (
        <TableRow
          selected={self._isSelected(index)}
          style={expanded ? { height: self.state.divHeight, backgroundColor: '#e9f4f3' } : { backgroundColor: '#e9f4f3' }}
          className={expanded ? 'expand' : null}
          hover
          key={index}
          onClick={event => self._expandRow(event, index)}
        >
          <TableCell padding="checkbox">
            <Checkbox style={expanded ? { paddingTop: '0', marginTop:'-4px' } : {}}  checked={self._isSelected(index)} onChange={() => self._onRowSelection(index)} />
          </TableCell>
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
              className="expanded"
              in={Boolean(expanded)}
              onExit={node => self._adjustCellHeight(node.parentElement.clientHeight)}
              onEntered={node => self._adjustCellHeight(node.parentElement.clientHeight)}
            >
              {expanded}
            </Collapse>
          </TableCell>
        </TableRow>
      );
    });

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          {limitMaxed ? <span>You have reached</span> : null}
          {limitNear && !limitMaxed ? <span>You are nearing</span> : null} your limit of authorized devices: {this.props.acceptedDevices} of{' '}
          {this.props.deviceLimit}
        </p>
      ) : null;

    const numSelected = self.state.selectedRows.length;

    return (
      <div className="tab-container">
        <Loader show={this.state.authLoading} />

        {this.props.showHelptips && this.state.devices.length ? (
          <div>
            <div
              id="onboard-2"
              className={this.props.highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
              data-tip
              data-for="review-devices-tip"
              data-event="click focus"
              style={{ left: '60%', top: '35px' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="review-devices-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <AuthDevices devices={this.state.devices.length} />
            </ReactTooltip>
          </div>
        ) : null}

        {this.state.devices.length && this.state.authLoading !== 'all' ? (
          <div className="padding-bottom">
            <h3 className="align-center">
              {this.props.count} {pluralize('devices', this.props.count)} pending authorization
            </h3>

            {deviceLimitWarning}

            <Table>
              <TableHead className="clickable">
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={numSelected > 0 && numSelected < self.state.devices.length}
                      checked={numSelected === self.state.devices.length}
                      onChange={() => self.onSelectAllClick()}
                    />
                  </TableCell>
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
                pageSize={20}
                current={this.state.currentPage || 1}
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
            <p>There are no devices pending authorization</p>
            {this.props.highlightHelp ? (
              <p>
                Visit the <Link to="/help/connecting-devices">Help section</Link> to learn how to connect devices to the Mender server.
              </p>
            ) : null}
          </div>
        )}

        {this.state.selectedRows.length ? (
          <div className="fixedButtons">
            <div className="float-right">
              {this.state.authLoading ? <Loader style={{ width: '100px', top: '7px', position: 'relative' }} table={true} waiting={true} show={true} /> : null}

              <span className="margin-right">
                {this.state.selectedRows.length} {pluralize('devices', this.state.selectedRows.length)} selected
              </span>
              <Button
                variant="contained"
                disabled={this.props.disabled || limitMaxed || selectedOverLimit}
                onClick={() => this._authorizeDevices()}
                color="primary"
              >
                {`Authorize ${this.state.selectedRows.length} ${pluralize('devices', this.state.selectedRows.length)}`}
              </Button>
              {deviceLimitWarning}
            </div>
          </div>
        ) : null}

        {this.props.showHelptips && this.state.devices.length ? (
          <div>
            <div
              id="onboard-3"
              className="tooltip highlight help"
              data-tip
              data-for="expand-auth-tip"
              data-event="click focus"
              style={{ left: '16%', top: '170px' }}
            >
              <HelpIcon />
            </div>
            <ReactTooltip id="expand-auth-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <ExpandAuth />
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  }
}
