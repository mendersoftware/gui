import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { RootRef, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import historyImage from '../../../assets/img/history.png';
import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
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
const tonight = new Date(new Date().setHours(23, 59, 59, 999));

const headers = [...defaultHeaders.slice(0, defaultHeaders.length - 1), { title: 'Status', renderer: DeploymentStatus }];

const type = DEPLOYMENT_STATES.finished;

let timer;

const BEGINNING_OF_TIME = '2016-01-01T00:00:00.000Z';
const SORTING_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc'
};

export const Past = props => {
  const {
    advanceOnboarding,
    count,
    createClick,
    getDeploymentsByStatus,
    groups,
    loading,
    onboardingState,
    past,
    setSnackbar,
    startDate: startDateProp = today,
    endDate: endDateProp = tonight
  } = props;
  const [deviceGroup, setDeviceGroup] = useState('');
  const [endDate, setEndDate] = useState(endDateProp);
  const [startDate, setStartDate] = useState(startDateProp);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  // eslint-disable-next-line no-unused-vars
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
  const [timeRangeToggle, setTimeRangeToggle] = useState(false);
  const deploymentsRef = useRef();

  const handleResize = () => {
    setTimeout(() => {
      setSize({ height: window.innerHeight, width: window.innerWidth });
    }, 500);
  };

  useEffect(() => {
    clearInterval(timer);
    timer = setInterval(refreshPast, refreshDeploymentsLength);
    const roundedStartDate = Math.round(Date.parse(BEGINNING_OF_TIME) / 1000);
    const roundedEndDate = Math.round(Date.parse(endDate) / 1000);
    getDeploymentsByStatus(type, page, perPage, roundedStartDate, roundedEndDate, deviceGroup, true, SORTING_DIRECTIONS.desc).then(deploymentsAction => {
      const deploymentsList = deploymentsAction ? Object.values(deploymentsAction[0].deployments) : [];
      if (deploymentsList.length) {
        let newStartDate = new Date(deploymentsList[0].created);
        newStartDate.setHours(0, 0, 0, 0);
        let newEndDate = new Date(deploymentsList[deploymentsList.length - 1].created);
        newEndDate.setHours(23, 59, 59, 999);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setTimeRangeToggle(!timeRangeToggle);
      }
    });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  useEffect(() => {
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
  }, [past, onboardingState.complete]);

  /*
  / refresh only finished deployments
  /
  */
  const refreshPast = (
    currentPage = page,
    currentPerPage = perPage,
    currentStartDate = startDate,
    currentEndDate = endDate,
    currentDeviceGroup = deviceGroup
  ) => {
    setPage(currentPage);
    setPerPage(currentPerPage);
    setEndDate(currentEndDate);
    setStartDate(currentStartDate);
    setDeviceGroup(currentDeviceGroup);
    const roundedStartDate = Math.round(Date.parse(currentStartDate) / 1000);
    const roundedEndDate = Math.round(Date.parse(currentEndDate) / 1000);
    return getDeploymentsByStatus(type, currentPage, currentPerPage, roundedStartDate, roundedEndDate, currentDeviceGroup)
      .then(deploymentsAction => {
        clearRetryTimer(type, setSnackbar);
        if (deploymentsAction && deploymentsAction[0].total && !deploymentsAction[0].deploymentIds.length) {
          return refreshPast(currentPage, currentPerPage, currentStartDate, currentEndDate, currentDeviceGroup);
        }
      })
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar));
  };

  let onboardingComponent = null;
  if (deploymentsRef.current) {
    const detailsButtons = deploymentsRef.current.getElementsByClassName('MuiButton-contained');
    const left = detailsButtons.length
      ? deploymentsRef.current.offsetLeft + detailsButtons[0].offsetLeft + detailsButtons[0].offsetWidth / 2 + 15
      : deploymentsRef.current.offsetWidth;
    let anchor = { left: deploymentsRef.current.offsetWidth / 2, top: deploymentsRef.current.offsetTop };
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
        <TimerangePicker onChange={(start, end) => refreshPast(1, perPage, start, end)} toggleActive={timeRangeToggle} />
        <TimeframePicker
          classNames="margin-left margin-right inline-block"
          onChange={(start, end) => refreshPast(1, perPage, start, end)}
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
          onInputChange={(e, value) => refreshPast(1, perPage, startDate, endDate, value)}
          renderInput={params => (
            <TextField {...params} label="Filter by device group" placeholder="Select a group" InputProps={{ ...params.InputProps }} style={{ marginTop: 0 }} />
          )}
        />
      </div>
      <div className="deploy-table-contain">
        <Loader show={loading} />
        {/* TODO: fix status retrieval for past deployments to decide what to show here - */}
        {!loading && !!past.length && !!onboardingComponent && onboardingComponent}
        {!!past.length && (
          <RootRef rootRef={deploymentsRef}>
            <DeploymentsList
              {...props}
              componentClass="margin-left-small"
              count={count || past.length}
              headers={headers}
              items={past}
              page={page}
              onChangeRowsPerPage={newPerPage => refreshPast(1, newPerPage)}
              onChangePage={refreshPast}
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
            <img src={historyImage} alt="Past" />
          </div>
        )}
      </div>
    </div>
  );
};

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
