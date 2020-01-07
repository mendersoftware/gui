import React from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';

// material ui
import { Grid, RootRef, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import { setSnackbar } from '../../actions/appActions';
import { selectDeployment, getSingleDeploymentStats } from '../../actions/deploymentActions';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import AutoSelect from '../common/forms/autoselect';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import DeploymentStatus from './deploymentstatus';
import { formatTime } from '../../helpers';
import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

const timeranges = {
  today: { start: 0, end: 0, title: 'Today' },
  yesterday: { start: 1, end: 1, title: 'Yesterday' },
  week: { start: 6, end: 0, title: 'Last 7 days' },
  month: { start: 29, end: 0, title: 'Last 30 days' }
};

export class Past extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      retry: false,
      today: new Date(),
      active: 'today'
    };
    this._setDateRange(timeranges['today'].start, timeranges['today'].end);
  }

  componentDidMount() {
    const self = this;
    if (self.props.showHelptips && self.props.showOnboardingTips && !self.props.onboardingComplete && this.props.past.length) {
      const progress = getOnboardingStepCompleted('artifact-modified-onboarding') && this.props.past.length > 1 ? 4 : 3;
      setTimeout(() => {
        !self.props.onboardingComplete
          ? self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={progress} />, () => {}, self.onCloseSnackbar)
          : null;
      }, 400);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.startDate !== prevProps.startDate && this.state.startDate && this.state.startDate !== this.props.startDate) ||
      (this.props.endDate !== prevProps.endDate && this.state.endDate && this.state.endDate !== this.props.endDate)
    ) {
      this._handleDateChange(1, this.props.startDate, this.props.endDate);
    }
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  };

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
    var deployment = this.props.past[rowNumber];
    this.props.selectDeployment(deployment.id);
    this.props.showReport('past');
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
    const self = this;
    const pastMap = this.props.past.map((deployment, index) => {
      let time = '-';
      if (deployment.finished) {
        time = <Time value={formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" />;
      }

      //  get statistics
      const status = (
        <DeploymentStatus
          isActiveTab={this.props.isActiveTab}
          id={deployment.id}
          stats={deployment.stats}
          setFinished={() => {}}
          refreshStatus={id => self.props.getSingleDeploymentStats(id)}
        />
      );

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
    });

    const menuItems = this.props.groups.reduce(
      (accu, item) => {
        accu.push({ title: item, value: item });
        return accu;
      },
      [{ title: 'All devices', value: 'All devices' }]
    );

    let onboardingComponent = null;
    if (this.deploymentsRef) {
      let anchor = { left: 250, top: this.deploymentsRef.offsetParent.offsetTop + this.deploymentsRef.offsetTop + this.deploymentsRef.offsetHeight };
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor });
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed-failure', { anchor }, onboardingComponent);
      onboardingComponent = getOnboardingComponentFor('onboarding-finished', { anchor }, onboardingComponent);
    }

    return (
      <div className="fadeIn margin-top-large">
        <Grid container spacing={2} className="datepicker-container" style={{ paddingTop: '4px' }}>
          <Grid item>
            <span>Filter by date</span>
            <ul className="unstyled link-list horizontal">
              {Object.entries(timeranges).map(([key, range]) => (
                <li key={`filter-by-${key}`}>
                  <a className={this.state.active === key ? 'active' : ''} onClick={() => this.setDefaultRange(range.start, range.end, key)}>
                    {range.title}
                  </a>
                </li>
              ))}
            </ul>
          </Grid>

          <MuiPickersUtilsProvider utils={MomentUtils} className="margin-left margin-right inline-block">
            <Grid item>
              <DatePicker
                variant="inline"
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
              <DatePicker
                variant="inline"
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

          {!this.props.loading && this.props.showHelptips && pastMap.length && onboardingComponent
            ? onboardingComponent // TODO: fix status retrieval for past deployments to decide what to show here -
            : null}

          {this.props.past.length && !!pastMap.length ? (
            <>
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
                <RootRef rootRef={ref => (this.deploymentsRef = ref)}>
                  <TableBody style={{ cursor: 'pointer', overflow: 'visible' }}>{pastMap}</TableBody>
                </RootRef>
              </Table>
              <Pagination
                count={self.props.count}
                rowsPerPage={perPage}
                onChangeRowsPerPage={value => self.setState({ perPage: value }, () => self._refreshPast(1, value))}
                page={page}
                onChangePage={pageNo => self._refreshPast(pageNo)}
              />
            </>
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

const actionCreators = { setSnackbar, selectDeployment, getSingleDeploymentStats };

const mapStateToProps = state => {
  const past = state.deployments.byStatus.finished.selectedDeploymentIds.map(id => state.deployments.byId[id]);
  return {
    onboardingComplete: state.users.onboarding.complete,
    past,
    count: state.deployments.byStatus.finished.total,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Past);
