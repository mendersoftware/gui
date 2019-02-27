import React from 'react';
import Time from 'react-time';
import { Collapse } from 'react-collapse';
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
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import InfoIcon from 'react-material-icons/icons/action/info-outline';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      minHeight: 230,
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
        self._adjustHeight();
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

  _adjustHeight() {
    // do this when number of devices changes
    var h = this.state.devices.length * 55;
    h += 200;
    this.setState({ minHeight: h });
  }
  _sortColumn() {
    console.log('sort');
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
    self.setState({ selectedRows: [], currentPage: pageNo, pageLoading: true, expandRow: null, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  _onRowSelection(selectedRows) {
    if (selectedRows === 'all') {
      var rows = Array.apply(null, { length: this.state.devices.length }).map(Number.call, Number);
      this.setState({ selectedRows: rows });
    } else if (selectedRows === 'none') {
      this.setState({ selectedRows: [] });
    } else {
      this.setState({ selectedRows: selectedRows });
    }
  }

  _isSelected(index) {
    return this.state.selectedRows.indexOf(index) !== -1;
  }

  _getDevicesFromSelectedRows() {
    // use selected rows to get device from corresponding position in devices array
    var devices = [];
    for (var i = 0; i < this.state.selectedRows.length; i++) {
      devices.push(this.state.devices[this.state.selectedRows[i]]);
    }
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
    var limitMaxed = this.props.deviceLimit ? this.props.deviceLimit <= this.props.acceptedDevices : false;
    var limitNear = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.devices.length : false;
    var selectedOverLimit = this.props.deviceLimit ? this.props.deviceLimit < this.props.acceptedDevices + this.state.selectedRows.length : false;

    var devices = this.state.devices.map(function(device, index) {
      var self = this;
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
            styles={self.props.styles}
            deviceId={self.state.deviceId}
            device={self.state.expandedDevice}
            unauthorized={true}
            pause={self.props.pause}
          />
        );
      }

      return (
        <TableRow selected={this._isSelected(index)} style={{ backgroundColor: '#e9f4f3' }} className={expanded ? 'expand' : null} hoverable={true} key={index}>
          <TableRowColumn className="no-click-cell" style={expanded ? { height: this.state.divHeight } : null}>
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                self._expandRow(index);
              }}
            >
              {id_attribute}
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell">
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                self._expandRow(index);
              }}
            >
              <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell">
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                self._expandRow(index);
              }}
            >
              <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" />
            </div>
          </TableRowColumn>
          <TableRowColumn className="no-click-cell capitalized">
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                self._expandRow(index);
              }}
            >
              {device.status}
            </div>
          </TableRowColumn>

          <TableRowColumn style={{ width: '55px', paddingRight: '0', paddingLeft: '12px' }} className="expandButton">
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                this._expandRow(index);
              }}
            >
              <IconButton className="float-right">
                <FontIcon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</FontIcon>
              </IconButton>
            </div>
          </TableRowColumn>
          <TableRowColumn style={{ width: '0', padding: '0', overflow: 'visible' }}>
            <div
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                this._expandRow(index);
              }}
            >
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
            </div>
          </TableRowColumn>
        </TableRow>
      );
    }, this);

    var deviceLimitWarning =
      limitMaxed || limitNear ? (
        <p className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          <span className={limitMaxed ? null : 'hidden'}>You have reached</span>
          <span className={limitNear && !limitMaxed ? null : 'hidden'}>You are nearing</span> your limit of authorized devices: {this.props.acceptedDevices} of{' '}
          {this.props.deviceLimit}
        </p>
      ) : null;

    var minHeight = deviceLimitWarning ? this.state.minHeight + 20 : this.state.minHeight;

    return (
      <Collapse
        springConfig={{ stiffness: 190, damping: 20 }}
        style={{ minHeight: minHeight, width: '100%' }}
        isOpened={true}
        id="authorize"
        className="absolute authorize padding-top"
      >
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
              <FontIcon className="material-icons">help</FontIcon>
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

            <Table multiSelectable={true} onRowSelection={rows => this._onRowSelection(rows)} allRowsSelected={this.state.allRowsSelected}>
              <TableHeader className="clickable" displaySelectAll={true} adjustForCheckbox={true}>
                <TableRow>
                  <TableHeaderColumn className="columnHeader" tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                    {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
                    <FontIcon
                      onClick={this.props.openSettingsDialog}
                      style={{ fontSize: '16px' }}
                      color={'#c7c7c7'}
                      hoverColor={'#aeaeae'}
                      className="material-icons hover float-right"
                    >
                      settings
                    </FontIcon>
                  </TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="First request">
                    First request
                  </TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Last updated">
                    Last updated
                  </TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" tooltip="Status">
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn className="columnHeader" style={{ width: '55px', paddingRight: '12px', paddingLeft: '0' }} />
                </TableRow>
              </TableHeader>
              <TableBody showRowHover={true} displayRowCheckbox={true} className="clickable" deselectOnClickaway={false}>
                {devices}
              </TableBody>
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
                Visit the <Link to='/help/connecting-devices'>Help section</Link> to learn how to connect devices to the Mender server.
              </p>
            ) : null}
          </div>
        )}

        {this.state.selectedRows.length ? (
          <div className="fixedButtons">
            <div className="float-right">
              <div style={{ width: '100px', top: '7px', position: 'relative' }} className={this.state.authLoading ? 'inline-block' : 'hidden'}>
                <Loader table={true} waiting={true} show={true} />
              </div>

              <span className="margin-right">
                {this.state.selectedRows.length} {pluralize('devices', this.state.selectedRows.length)} selected
              </span>
              <RaisedButton
                disabled={this.props.disabled || limitMaxed || selectedOverLimit}
                onClick={() => this._authorizeDevices()}
                primary={true}
                label={`Authorize ${this.state.selectedRows.length} ${pluralize('devices', this.state.selectedRows.length)}`}
              />
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
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip id="expand-auth-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <ExpandAuth />
            </ReactTooltip>
          </div>
        ) : null}
      </Collapse>
    );
  }
}
