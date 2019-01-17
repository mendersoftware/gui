import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import { FinishedDeployment } from '../helptips/helptooltips';

import DeploymentStatus from './deploymentstatus';

import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';
import Loader from '../common/loader';

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import DatePicker from 'material-ui/DatePicker';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';

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
        <TableRow key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn>
            <Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn>{time}</TableRowColumn>
          <TableRowColumn style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableRowColumn>
          <TableRowColumn style={{ overflow: 'visible', width: '350px' }}>{status}</TableRowColumn>
        </TableRow>
      );
    }, this);

    var menuItems = [];
    var allDevicesGroup = {
      text: 'All devices',
      value: (
        <MenuItem key="All devices" value="All devices">
          All devices
        </MenuItem>
      )
    };
    menuItems.push(allDevicesGroup);
    const menuGroupItems = this.props.groups.map((group, i) => ({
      text: group,
      value: (
        <MenuItem key={i} value={group}>
          {group}
        </MenuItem>
      )
    }));
    menuItems.push(...menuGroupItems);

    return (
      <div className="fadeIn">
        <div className="datepicker-container">
          <div className="inline-block align-bottom" style={{ marginBottom: '12px' }}>
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

          <div className="align-bottom margin-left margin-right inline-block">
            <DatePicker
              onChange={(event, date) => this._handleChangeStartDate(event, date)}
              autoOk={true}
              floatingLabelText="From"
              defaultDate={this.props.startDate}
              disableYearSelection={true}
              value={this.props.startDate}
              maxDate={this.props.endDate || this.state.today}
              style={{ display: 'inline-block', marginRight: '20px' }}
              textFieldStyle={{ width: '160px' }}
            />

            <DatePicker
              onChange={(event, date) => this._handleChangeEndDate(event, date)}
              autoOk={true}
              floatingLabelText="To"
              defaultDate={this.props.endDate}
              value={this.props.endDate}
              maxDate={this.state.today}
              disableYearSelection={true}
              style={{ display: 'inline-block' }}
              textFieldStyle={{ width: '160px' }}
            />
          </div>

          <div className="inline-block align-bottom margin-left">
            <AutoComplete
              ref="autocomplete"
              hintText="Select a group"
              dataSource={menuItems}
              onUpdateInput={value => this.handleUpdateInput(value)}
              floatingLabelText="Filter by device group"
              floatingLabelFixed={true}
              floatingLabelStyle={{ color: '#404041', fontSize: '17px', top: '37px' }}
              filter={AutoComplete.fuzzyFilter}
              openOnFocus={true}
            />
            <IconButton style={{ marginLeft: '-10px' }} disabled={this.state.disableClear} iconStyle={{ fontSize: '16px' }} onClick={() => this.clearAuto()}>
              <FontIcon className="material-icons">clear</FontIcon>
            </IconButton>
          </div>
        </div>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          <Table
            onCellClick={row => this._pastCellClick(row)}
            className={pastMap.length ? null : 'hidden'}
            selectable={false}
            style={{ overflow: 'visible' }}
            wrapperStyle={{ overflow: 'visible' }}
            bodyStyle={{ overflow: 'visible' }}
          >
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow style={{ overflow: 'visible' }}>
                <TableHeaderColumn>Updating to</TableHeaderColumn>
                <TableHeaderColumn>Group</TableHeaderColumn>
                <TableHeaderColumn>Started</TableHeaderColumn>
                <TableHeaderColumn>Finished</TableHeaderColumn>
                <TableHeaderColumn style={{ textAlign: 'right', width: '100px' }}># Devices</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '350px' }}>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody showRowHover={true} displayRowCheckbox={false} style={{ cursor: 'pointer', overflow: 'visible' }}>
              {pastMap}
            </TableBody>
          </Table>

          {!this.props.loading && this.props.showHelptips && pastMap.length ? (
            <div>
              <div id="onboard-14" className="tooltip help" data-tip data-for="finished-deployment-tip" data-event="click focus">
                <FontIcon className="material-icons">help</FontIcon>
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
