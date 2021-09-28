import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { RootRef, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import historyImage from '../../../assets/img/history.png';
import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, selectDeployment, setDeploymentsState } from '../../actions/deploymentActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import { getOnboardingState } from '../../selectors';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentStatus } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';
import { tryMapDeployments } from '../../helpers';
import { SORTING_OPTIONS } from '../../constants/appConstants';

const headers = [...defaultHeaders.slice(0, defaultHeaders.length - 1), { title: 'Status', renderer: DeploymentStatus }];

const type = DEPLOYMENT_STATES.finished;

let timer;
let inputDelayTimer;

const BEGINNING_OF_TIME = '2016-01-01T00:00:00.000Z';

export const Past = props => {
  const {
    advanceOnboarding,
    createClick,
    getDeploymentsByStatus,
    groups,
    loading,
    onboardingState,
    past,
    pastSelectionState,
    setDeploymentsState,
    setSnackbar
  } = props;
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const [timeRangeToggle, setTimeRangeToggle] = useState(false);
  const [tonight] = useState(new Date(new Date().setHours(23, 59, 59)).toISOString());
  const deploymentsRef = useRef();
  const { endDate, page, perPage, search: deviceGroup, startDate, total: count, type: deploymentType } = pastSelectionState;

  useEffect(() => {
    const roundedStartDate = Math.round(Date.parse(startDate || BEGINNING_OF_TIME) / 1000);
    const roundedEndDate = Math.round(Date.parse(endDate) / 1000);
    getDeploymentsByStatus(type, page, perPage, roundedStartDate, roundedEndDate, deviceGroup, deploymentType, true, SORTING_OPTIONS.desc).then(
      deploymentsAction => {
        const deploymentsList = deploymentsAction ? Object.values(deploymentsAction[0].deployments) : [];
        if (deploymentsList.length) {
          let newStartDate = new Date(deploymentsList[deploymentsList.length - 1].created);
          newStartDate.setHours(0, 0, 0, 0);
          setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { startDate: newStartDate.toISOString() } });
          setTimeRangeToggle(!timeRangeToggle);
        }
      }
    );
    return () => {
      clearAllRetryTimers(setSnackbar);
    };
  }, []);

  useEffect(() => {
    clearInterval(timer);
    timer = setInterval(refreshPast, refreshDeploymentsLength);
    return () => {
      clearInterval(timer);
    };
  }, [page, perPage, startDate, endDate, deviceGroup, deploymentType]);

  useEffect(() => {
    if (!past.length || onboardingState.complete) {
      return;
    }
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
    currentDeviceGroup = deviceGroup,
    currentType = deploymentType
  ) => {
    setDeploymentsState({
      [DEPLOYMENT_STATES.finished]: {
        startDate: currentStartDate,
        endDate: currentEndDate,
        page: currentPage,
        perPage: currentPerPage,
        search: currentDeviceGroup,
        type: currentType
      }
    });
    const roundedStartDate = Math.round(Date.parse(currentStartDate) / 1000);
    const roundedEndDate = Math.round(Date.parse(currentEndDate) / 1000);
    return getDeploymentsByStatus(type, currentPage, currentPerPage, roundedStartDate, roundedEndDate, currentDeviceGroup, currentType)
      .then(deploymentsAction => {
        clearRetryTimer(type, setSnackbar);
        const { total, deploymentIds } = deploymentsAction[deploymentsAction.length - 1];
        if (total && !deploymentIds.length) {
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

  const onFilterUpdate = (...args) => {
    clearTimeout(inputDelayTimer);
    inputDelayTimer = setTimeout(() => refreshPast(...args), 700);
  };

  const onGroupFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { search: value } });
    onFilterUpdate(1, perPage, startDate, endDate, value);
  };

  const onTypeFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { type: value } });
    onFilterUpdate(1, perPage, startDate, endDate, deviceGroup, value);
  };

  const onTimeFilterChange = (start, end) => refreshPast(1, perPage, start, end);

  return (
    <div className="fadeIn margin-left margin-top-large">
      <div className="datepicker-container">
        <TimerangePicker endDate={endDate} onChange={onTimeFilterChange} startDate={startDate} />
        <TimeframePicker
          classNames="margin-left margin-right inline-block"
          onChange={onTimeFilterChange}
          endDate={endDate}
          startDate={startDate}
          tonight={tonight}
        />
        <Autocomplete
          id="device-group-selection"
          autoHighlight
          autoSelect
          filterSelectedOptions
          freeSolo
          handleHomeEndKeys
          inputValue={deviceGroup}
          options={groups}
          onInputChange={onGroupFilterChange}
          renderInput={params => (
            <TextField {...params} label="Filter by device group" placeholder="Select a group" InputProps={{ ...params.InputProps }} style={{ marginTop: 0 }} />
          )}
        />
        <Autocomplete
          id="deployment-type-selection"
          autoHighlight
          autoSelect
          filterSelectedOptions
          handleHomeEndKeys
          classes={{ input: deploymentType ? 'capitalized' : '', option: 'capitalized' }}
          inputValue={deploymentType}
          onInputChange={onTypeFilterChange}
          options={Object.keys(DEPLOYMENT_TYPES)}
          renderInput={params => (
            <TextField {...params} label="Filter by type" placeholder="Select a type" InputProps={{ ...params.InputProps }} style={{ marginTop: 0 }} />
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
              count={count}
              headers={headers}
              items={past}
              page={page}
              onChangeRowsPerPage={newPerPage => refreshPast(1, newPerPage)}
              onChangePage={refreshPast}
              pageSize={perPage}
              showPagination
              type={type}
            />
          </RootRef>
        )}
        {!(loading || past.length) && (
          <div className="dashboard-placeholder">
            <p>No finished deployments were found.</p>
            <p>
              Try adjusting the filters, or <a onClick={createClick}>Create a new deployment</a> to get started
            </p>
            <img src={historyImage} alt="Past" />
          </div>
        )}
      </div>
    </div>
  );
};

const actionCreators = { advanceOnboarding, getDeploymentsByStatus, setDeploymentsState, setSnackbar, selectDeployment };

const mapStateToProps = state => {
  const past = state.deployments.selectionState.finished.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    groups: ['All devices', ...Object.keys(groups)],
    onboardingState: getOnboardingState(state),
    past,
    pastSelectionState: state.deployments.selectionState.finished
  };
};

export default connect(mapStateToProps, actionCreators)(Past);
