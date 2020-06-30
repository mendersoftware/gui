import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Grid, RootRef } from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, getSingleDeploymentStats, selectDeployment } from '../../actions/deploymentActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import Loader from '../common/loader';
import AutoSelect from '../common/forms/autoselect';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentStatus } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

const timeranges = {
  today: { start: 0, end: 0, title: 'Today' },
  yesterday: { start: 1, end: 1, title: 'Yesterday' },
  week: { start: 6, end: 0, title: 'Last 7 days' },
  month: { start: 29, end: 0, title: 'Last 30 days' }
};

const today = new Date(new Date().setHours(0, 0, 0));
const tonight = new Date(new Date().setHours(23, 59, 59));

const headers = [...defaultHeaders.slice(0, defaultHeaders.length - 1), { title: 'Status', renderer: DeploymentStatus }];

const type = 'finished';

export class Past extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      active: 'today',
      deviceGroup: null,
      doneLoading: false,
      endDate: tonight,
      startDate: props.startDate || today,
      page: 1,
      perPage: 20,
      today: new Date()
    };
  }

  componentDidMount() {
    const self = this;
    self._setDateRange(timeranges['today'].start, timeranges['today'].end);
    clearInterval(self.timer);
    self.timer = setInterval(() => self.refreshPast(), refreshDeploymentsLength);
    self.refreshPast();
    if (self.props.showHelptips && self.props.showOnboardingTips && !self.props.onboardingComplete && this.props.past.length) {
      const progress = getOnboardingStepCompleted('artifact-modified-onboarding') && this.props.past.length > 1 ? 4 : 3;
      setTimeout(() => {
        !self.props.onboardingComplete
          ? self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={progress} />, () => {}, self.onCloseSnackbar)
          : null;
      }, 400);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  };

  _setDateRange(after, before) {
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - (after || 0));
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setDate(endDate.getDate() - (before || 0));
    endDate.setHours(23, 59, 59, 999);
    this.refreshPast(1, this.state.perPage, startDate, endDate, this.state.deviceGroup);
  }

  /*
  / refresh only finished deployments
  /
  */
  refreshPast(
    page = this.state.page,
    perPage = this.state.perPage,
    startDate = this.state.startDate,
    endDate = this.state.endDate,
    group = this.state.deviceGroup
  ) {
    const self = this;
    self.setState({ page, perPage, endDate, startDate, group }, () => {
      const roundedStartDate = Math.round(Date.parse(startDate) / 1000);
      const roundedEndDate = Math.round(Date.parse(endDate) / 1000);
      return Promise.resolve(self.props.getDeploymentsByStatus(type, page, perPage, roundedStartDate, roundedEndDate, group))
        .then(deploymentsAction => {
          clearRetryTimer(type, self.props.setSnackbar);
          if (deploymentsAction && deploymentsAction[0].total && !deploymentsAction[0].deploymentIds.length) {
            return self.refreshDeployments(...arguments);
          }
        })
        .catch(err => {
          console.log(err);
          let errormsg = err.error || 'Please check your connection';
          setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
        })
        .finally(() => self.setState({ doneLoading: true }));
    });
  }

  _handleChangeEndDate(date) {
    let startDate = this.state.startDate;
    if (date < startDate) {
      startDate = date;
      startDate._isAMomentObject ? startDate.startOf('day') : startDate.setHours(0, 0, 0, 0);
    }
    this.setState({
      active: ''
    });
    date._isAMomentObject ? date.endOf('day') : date.setHours(23, 59, 59, 999);

    // refresh deployment list
    this.refreshPast(1, this.state.perPage, startDate, date, this.state.deviceGroup);
  }

  setDefaultRange(after, before, active) {
    const self = this;
    self.setState({ active, doneLoading: false }, () => self._setDateRange(after, before));
  }

  render() {
    const self = this;
    const { count, createClick, groups, loading, past, showHelptips } = self.props;
    const { active, page, perPage, endDate, startDate } = self.state;

    const menuItems = groups.reduce(
      (accu, item) => {
        accu.push({ title: item, value: item });
        return accu;
      },
      [{ title: 'All devices', value: 'All devices' }]
    );

    let onboardingComponent = null;
    if (this.deploymentsRef) {
      const detailsButtons = self.deploymentsRef.getElementsByClassName('MuiButton-contained');
      const left = detailsButtons.length
        ? self.deploymentsRef.offsetLeft + detailsButtons[0].offsetLeft + detailsButtons[0].offsetWidth / 2 + 15
        : self.deploymentsRef.offsetWidth;
      let anchor = { left: self.deploymentsRef.offsetWidth / 2, top: self.deploymentsRef.offsetTop + self.deploymentsRef.offsetHeight };
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor });
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed-failure', { anchor: { left, top: anchor.top } }, onboardingComponent);
      onboardingComponent = getOnboardingComponentFor('onboarding-finished', { anchor }, onboardingComponent);
    }

    return (
      <div className="fadeIn margin-left margin-top-large">
        <Grid container spacing={2} className="datepicker-container" style={{ paddingTop: '4px' }}>
          <Grid item>
            <span>Filter by date</span>
            <ul className="unstyled link-list horizontal">
              {Object.entries(timeranges).map(([key, range]) => (
                <li key={`filter-by-${key}`}>
                  <a className={active === key ? 'active' : ''} onClick={() => self.setDefaultRange(range.start, range.end, key)}>
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
                onChange={date => self.refreshPast(1, perPage, date)}
                autoOk={true}
                label="From"
                value={startDate}
                maxDate={endDate || today}
                style={{ width: '160px', marginTop: 0 }}
              />
            </Grid>
            <Grid item>
              <DatePicker
                variant="inline"
                className="margin-right"
                onChange={date => self._handleChangeEndDate(date)}
                autoOk={true}
                label="To"
                value={endDate}
                maxDate={today}
                style={{ width: '160px', marginTop: 0 }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
          <Grid item>
            <AutoSelect
              label="Filter by device group"
              placeholder="Select a group"
              items={menuItems}
              onChange={value => self.refreshPast(1, perPage, startDate, endDate, value)}
              style={{ marginTop: 0 }}
            />
          </Grid>
        </Grid>

        <div className="deploy-table-contain">
          <Loader show={loading} />
          {/* TODO: fix status retrieval for past deployments to decide what to show here - */}
          {!loading && showHelptips && !!past.length && !!onboardingComponent && onboardingComponent}
          {!!past.length && (
            <RootRef rootRef={ref => (this.deploymentsRef = ref)}>
              <DeploymentsList
                {...self.props}
                componentClass="margin-left-small"
                count={count || past.length}
                headers={headers}
                items={past}
                page={page}
                onChangeRowsPerPage={newPerPage => self.refreshPast(1, newPerPage)}
                onChangePage={(...args) => self.refreshPast(...args)}
                pageSize={perPage}
                type={type}
              />
            </RootRef>
          )}
          {!(loading || past.length) && (
            <div className="dashboard-placeholder">
              <p>No finished deployments were found.</p>
              <p>
                Try a different date range, or <a onClick={createClick}>Create a new deployment</a> to get started
              </p>
              <img src="assets/img/history.png" alt="Past" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const actionCreators = { getDeploymentsByStatus, getSingleDeploymentStats, setSnackbar, selectDeployment };

const mapStateToProps = state => {
  const past = state.deployments.byStatus.finished.selectedDeploymentIds.map(id => state.deployments.byId[id]);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    count: state.deployments.byStatus.finished.total,
    groups: Object.keys(groups),
    onboardingComplete: state.users.onboarding.complete,
    past,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips
  };
};

export default connect(mapStateToProps, actionCreators)(Past);
