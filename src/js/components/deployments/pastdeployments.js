import React from 'react';
import { connect } from 'react-redux';

// material ui
import { RootRef, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import { getOnboardingState } from '../../selectors';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentStatus } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

const today = new Date(new Date().setHours(0, 0, 0));
const tonight = new Date(new Date().setHours(23, 59, 59));

const headers = [...defaultHeaders.slice(0, defaultHeaders.length - 1), { title: 'Status', renderer: DeploymentStatus }];

const type = 'finished';

export class Past extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      deviceGroup: '',
      endDate: props.endDate || tonight,
      startDate: props.startDate || today,
      page: 1,
      perPage: 20
    };
  }

  componentDidMount() {
    const self = this;
    clearInterval(self.timer);
    self.timer = setInterval(() => self.refreshPast(), refreshDeploymentsLength);
    self.refreshPast();
  }

  componentDidUpdate() {
    const { advanceOnboarding, onboardingState, past, setSnackbar } = this.props;
    if (past.length && !onboardingState.complete) {
      const pastDeploymentsFailed = past.reduce(
        (accu, item) =>
          item.status === 'failed' ||
          (item.stats && item.stats.noartifact + item.stats.failure + item.stats['already-installed'] + item.stats.aborted > 0) ||
          accu,
        false
      );
      if (pastDeploymentsFailed) {
        advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE);
      } else {
        advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION);
      }
      setTimeout(() => {
        let notification = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION, onboardingState);
        notification = getOnboardingComponentFor(onboardingSteps.ONBOARDING_FINISHED_NOTIFICATION, onboardingState, {}, notification);
        !!notification && setSnackbar('open', 10000, '', notification, () => {}, true);
      }, 400);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers(this.props.setSnackbar);
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
    deviceGroup = this.state.deviceGroup
  ) {
    const self = this;
    self.setState({ page, perPage, endDate, startDate, deviceGroup }, () => {
      const roundedStartDate = Math.round(Date.parse(startDate) / 1000);
      const roundedEndDate = Math.round(Date.parse(endDate) / 1000);
      return Promise.resolve(self.props.getDeploymentsByStatus(type, page, perPage, roundedStartDate, roundedEndDate, deviceGroup))
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
        });
    });
  }

  render() {
    const self = this;
    const { count, createClick, groups, loading, onboardingState, past } = self.props;
    const { deviceGroup, page, perPage, endDate, startDate } = self.state;
    let onboardingComponent = null;
    if (this.deploymentsRef) {
      const detailsButtons = self.deploymentsRef.getElementsByClassName('MuiButton-contained');
      const left = detailsButtons.length
        ? self.deploymentsRef.offsetLeft + detailsButtons[0].offsetLeft + detailsButtons[0].offsetWidth / 2 + 15
        : self.deploymentsRef.offsetWidth;
      let anchor = { left: self.deploymentsRef.offsetWidth / 2, top: self.deploymentsRef.offsetTop };
      onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor });
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE,
        onboardingState,
        { anchor: { left, top: anchor.top } },
        onboardingComponent
      );
      onboardingComponent = getOnboardingComponentFor(onboardingSteps.ONBOARDING_FINISHED, onboardingState, { anchor }, onboardingComponent);
    }

    return (
      <div className="fadeIn margin-left margin-top-large">
        <div className="datepicker-container">
          <TimerangePicker onChange={(start, end) => self.refreshPast(1, perPage, start, end)} />
          <TimeframePicker
            classNames="margin-left margin-right inline-block"
            onChange={(start, end) => self.refreshPast(1, perPage, start, end)}
            endDate={endDate}
            startDate={startDate}
            tonight={tonight}
          />
          <Autocomplete
            id="device-group-selection"
            autoSelect
            filterSelectedOptions
            freeSolo
            handleHomeEndKeys
            inputValue={deviceGroup}
            options={groups}
            onInputChange={(e, value) => self.refreshPast(1, perPage, startDate, endDate, value)}
            renderInput={params => (
              <TextField
                {...params}
                label="Filter by device group"
                placeholder="Select a group"
                InputProps={{ ...params.InputProps }}
                style={{ marginTop: 0 }}
              />
            )}
          />
        </div>
        <div className="deploy-table-contain">
          <Loader show={loading} />
          {/* TODO: fix status retrieval for past deployments to decide what to show here - */}
          {!loading && !!past.length && !!onboardingComponent && onboardingComponent}
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

const actionCreators = { advanceOnboarding, getDeploymentsByStatus, setSnackbar, selectDeployment };

const mapStateToProps = state => {
  const past = state.deployments.byStatus.finished.selectedDeploymentIds.map(id => state.deployments.byId[id]);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    count: state.deployments.byStatus.finished.total,
    groups: ['All devices', ...Object.keys(groups)],
    onboardingState: getOnboardingState(state),
    past
  };
};

export default connect(mapStateToProps, actionCreators)(Past);
