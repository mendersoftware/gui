import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import HelpIcon from '@material-ui/icons/Help';

import InlineDatePicker from 'material-ui-pickers/DatePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import MomentUtils from '@date-io/moment';

import Loader from '../common/loader';
import AutoSelect from '../common/forms/autoselect';
import { FinishedDeployment } from '../helptips/helptooltips';
import DeploymentStatus from './deploymentstatus';
import { formatTime } from '../../helpers';

export default class Past extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      retry: false,
      today: new Date(),
      active: 'today'
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
  _handleDateChange(pageNo, createdAfter, createdBefore) {
    createdAfter = createdAfter || this.props.startDate;
    createdBefore = createdBefore || this.props.endDate;
    this.props.refreshPast(pageNo, createdAfter, createdBefore, this.props.pageSize, this.props.deviceGroup);
  }
  _handlePageChange(pageNo) {
    this.props.refreshPast(pageNo, this.props.startDate, this.props.endDate, this.props.pageSize, this.props.deviceGroup);
  }
  _handleChangeStartDate(date) {
    // refresh deployment list
    this._handleDateChange(1, date, null);
  }

  _handleChangeEndDate(date) {
    var startDate = this.props.startDate;
    if (date < startDate) {
      startDate = date;
      startDate._isAMomentObject ? startDate.startOf('day') : startDate.setHours(0, 0, 0, 0);
    }
    this.setState({
      active: ''
    });
    date._isAMomentObject ? date.endOf('day') : date.setHours(23, 59, 59, 999);

    // refresh deployment list
    this._handleDateChange(1, startDate, date);
  }

  setDefaultRange(after, before, active) {
    this._setDateRange(after, before);
    this.setState({ active: active });
  }

  handleUpdateInput(value) {
    this.props.refreshPast(1, this.props.startDate, this.props.endDate, this.props.pageSize, value);
  }

  render() {
    var pastMap = this.props.past.map(function(deployment, index) {
      var time = '-';
      if (deployment.finished) {
        time = <Time value={formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" />;
      }

      //  get statistics
      var status = <DeploymentStatus isActiveTab={this.props.isActiveTab} id={deployment.id} />;

      return (
        <TableRow hover key={index} onClick={() => this._pastCellClick(index)}>
          <TableCell>{deployment.artifact_name}</TableCell>
          <TableCell>{deployment.name}</TableCell>
          <TableCell>
            <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell>{time}</TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableCell>
          <TableCell style={{ overflow: 'visible', minWidth: '400px' }}>{status}</TableCell>
        </TableRow>
      );
    }, this);

    const menuItems = this.props.groups.reduce(
      (accu, item) => {
        accu.push({ title: item, value: item });
        return accu;
      },
      [{ title: 'All devices', value: 'All devices' }]
    );

    return (
      <div className="fadeIn margin-top-large">
        <Grid container spacing={16} className="datepicker-container" style={{paddingTop: '4px'}}>
          <Grid item>
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
          </Grid>

          <MuiPickersUtilsProvider utils={MomentUtils} className="margin-left margin-right inline-block">
            <Grid item>
              <InlineDatePicker
                className="margin-right"
                onChange={date => this._handleChangeStartDate(date)}
                autoOk={true}
                label="From"
                value={this.props.startDate}
                maxDate={this.props.endDate || this.state.today}
                style={{ width: '160px', marginTop: 0 }}
              />
            </Grid>
            <Grid item>
              <InlineDatePicker
                className="margin-right"
                onChange={date => this._handleChangeEndDate(date)}
                autoOk={true}
                label="To"
                value={this.props.endDate}
                maxDate={this.state.today}
                style={{ width: '160px', marginTop: 0 }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
          <Grid item>
            <AutoSelect
              label="Filter by device group"
              placeholder="Select a group"
              errorText="Choose a Release to deploy"
              items={menuItems}
              onChange={value => this.handleUpdateInput(value)}
              style={{ marginTop: 0 }}
            />
          </Grid>
        </Grid>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          {pastMap.length ? (
            <Table style={{ overflow: 'visible' }}>
              <TableHead>
                <TableRow style={{ overflow: 'visible' }}>
                  <TableCell>Updating to</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Finished</TableCell>
                  <TableCell style={{ textAlign: 'right', width: '100px' }}># Devices</TableCell>
                  <TableCell style={{ minWidth: '400px' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={{ cursor: 'pointer', overflow: 'visible' }}>{pastMap}</TableBody>
            </Table>
          ) : null}

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
