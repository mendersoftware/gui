import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';

import Autosuggest, { defaultProps } from '@plan-three/material-ui-autosuggest';

import ClearIcon from '@material-ui/icons/Clear';
import HelpIcon from '@material-ui/icons/Help';

import InlineDatePicker from 'material-ui-pickers/DatePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import MomentUtils from '@date-io/moment';

import Loader from '../common/loader';
import { FinishedDeployment } from '../helptips/helptooltips';
import DeploymentStatus from './deploymentstatus';

export default class Past extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      retry: false,
      today: new Date(),
      active: 'today',
      disableClear: true
    };
  }
  _setDateRange(after, before) {
    var self = this;
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - (after || 0));
    startDate.setHours(0, 0, 0, 0);
    var endDate = new Date();
    endDate.setDate(endDate.getDate() - (before || 0));
    endDate.setHours(23, 59, 59, 999);

    self._handleDateChange(1, startDate, endDate);
  }
  _pastCellClick(rowNumber) {
    // adjust index to allow for client side pagination
    var report = this.props.past[rowNumber];
    this.props.showReport(report, 'past');
  }
  _formatTime(date) {
    if (date) {
      return date
        .replace(' ', 'T')
        .replace(/ /g, '')
        .replace('UTC', '');
    }
    return;
  }
  _handleDateChange(pageNo, createdAfter, createdBefore) {
    createdAfter = createdAfter || this.props.startDate;
    createdBefore = createdBefore || this.props.endDate;
    this.props.refreshPast(pageNo, createdAfter, createdBefore, this.props.pageSize, this.props.deviceGroup);
  }
  _handlePageChange(pageNo) {
    this.props.refreshPast(pageNo, this.props.startDate, this.props.endDate, this.props.pageSize, this.props.deviceGroup);
  }
  _handleChangeStartDate(event, date) {
    this.setState({
      active: ''
    });

    // refresh deployment list
    this._handleDateChange(1, date, null);
  }

  _handleChangeEndDate(event, date) {
    var startDate = this.props.startDate;
    if (date < startDate) {
      startDate = date;
      startDate.setHours(0, 0, 0, 0);
    }
    this.setState({
      active: ''
    });
    date.setHours(23, 59, 59, 999);

    // refresh deployment list
    this._handleDateChange(1, startDate, date);
  }

  setDefaultRange(after, before, active) {
    this._setDateRange(after, before);
    this.setState({ active: active });
  }

  handleUpdateInput(value) {
    var self = this;
    setTimeout(() => {
      self.setState({ disableClear: !value });
    }, 150);
    this.props.refreshPast(1, this.props.startDate, this.props.endDate, this.props.pageSize, value);
  }

  clearAuto() {
    var oldValue = this.refs['autocomplete'].state.searchText;
    this.refs['autocomplete'].setState({ searchText: '' });
    if (oldValue) {
      this.handleUpdateInput(null);
    }
  }

  render() {
    var pastMap = this.props.past.map(function(deployment, index) {
      var time = '-';
      if (deployment.finished) {
        time = <Time value={this._formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" />;
      }

      //  get statistics
      var status = <DeploymentStatus isActiveTab={this.props.isActiveTab} id={deployment.id} />;

      return (
        <TableRow hover key={index} onClick={row => this._pastCellClick(row)}>
          <TableCell>{deployment.artifact_name}</TableCell>
          <TableCell>{deployment.name}</TableCell>
          <TableCell>
            <Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell>{time}</TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableCell>
          <TableCell style={{ overflow: 'visible', width: '350px' }}>{status}</TableCell>
        </TableRow>
      );
    }, this);

    const menuItems = this.props.groups.reduce(
      (accu, item) => {
        accu.push({ text: item });
        return accu;
      },
      [{ text: 'All devices' }]
    );

    return (
      <div className="fadeIn">
        <div className="datepicker-container">
          <div className="inline-block">
            <span>Filter by date</span>
            <ul className="unstyled link-list horizontal">
              <li>
                <a className={this.state.active === 'today' ? 'active' : ''} onClick={() => this.setDefaultRange(0, 0, 'today')}>
                  Today
                </a>
              </li>
              <li>
                <a className={this.state.active === 'yesterday' ? 'active' : ''} onClick={() => this.setDefaultRange(1, 1, 'yesterday')}>
                  Yesterday
                </a>
              </li>
              <li>
                <a className={this.state.active === 'week' ? 'active' : ''} onClick={() => this.setDefaultRange(6, 0, 'week')}>
                  Last 7 days
                </a>
              </li>
              <li>
                <a className={this.state.active === 'month' ? 'active' : ''} onClick={() => this.setDefaultRange(29, 0, 'month')}>
                  Last 30 days
                </a>
              </li>
            </ul>
          </div>

          <MuiPickersUtilsProvider utils={MomentUtils} className="margin-left margin-right inline-block">
            <InlineDatePicker
              onChange={(event, date) => this._handleChangeStartDate(event, date)}
              autoOk={true}
              label="From"
              onlyCalendar={true}
              value={this.props.startDate}
              maxDate={this.props.endDate || this.state.today}
              style={{ marginRight: '20px', width: '160px' }}
            />

            <InlineDatePicker
              onChange={(event, date) => this._handleChangeEndDate(event, date)}
              autoOk={true}
              label="To"
              value={this.props.endDate}
              maxDate={this.state.today}
              onlyCalendar={true}
              style={{ width: '160px' }}
            />
          </MuiPickersUtilsProvider>

          <Autosuggest
            className="inline-block margin-left"
            // ref="autocomplete"
            label="Filter by device group"
            suggestions={menuItems}
            fullWidth={false}
            helperText="Select a group"
            onChange={value => this.handleUpdateInput(value)}
            fuzzySearchOpts={{
              ...defaultProps.fuzzySearchOpts,
              keys: ['text']
            }}
            openOnFocus={true}
          />
          <IconButton className="inline-block" style={{ fontSize: '16px' }} disabled={this.state.disableClear} onClick={() => this.clearAuto()}>
            <ClearIcon />
          </IconButton>
        </div>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          <Table className={pastMap.length ? null : 'hidden'} style={{ overflow: 'visible' }}>
            <TableHead>
              <TableRow style={{ overflow: 'visible' }}>
                <TableCell>Updating to</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Finished</TableCell>
                <TableCell style={{ textAlign: 'right', width: '100px' }}># Devices</TableCell>
                <TableCell style={{ width: '350px' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ cursor: 'pointer', overflow: 'visible' }}>{pastMap}</TableBody>
          </Table>

          {!this.props.loading && this.props.showHelptips && pastMap.length ? (
            <div>
              <div id="onboard-14" className="tooltip help" data-tip data-for="finished-deployment-tip" data-event="click focus">
                <HelpIcon />
              </div>
              <ReactTooltip id="finished-deployment-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <FinishedDeployment />
              </ReactTooltip>
            </div>
          ) : null}

          {this.props.past.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.props.pageSize}
              current={this.props.page || 1}
              total={this.props.count}
              onChange={page => this._handlePageChange(page)}
            />
          ) : (
            <div className={this.props.loading || pastMap.length ? 'hidden' : 'dashboard-placeholder'}>
              <p>No finished deployments were found.</p>
              <p>
                Try a different date range, or <a onClick={this.props.createClick}>Create a new deployment</a> to get started
              </p>
              <img src="assets/img/history.png" alt="Past" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
