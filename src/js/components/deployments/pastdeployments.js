// Copyright 2015 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material ui
import { Autocomplete, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import historyImage from '../../../assets/img/history.png';
import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, setDeploymentsState } from '../../actions/deploymentActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { BEGINNING_OF_TIME, SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getISOStringBoundaries, tryMapDeployments } from '../../helpers';
import { getIdAttribute, getOnboardingState, getUserCapabilities } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import { clearAllRetryTimers, clearRetryTimer, setRetryTimer } from '../../utils/retrytimer';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import { DeploymentSize, DeploymentStatus } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';
import DeploymentsList, { defaultHeaders } from './deploymentslist';

const headers = [
  ...defaultHeaders.slice(0, defaultHeaders.length - 1),
  { title: 'Status', renderer: DeploymentStatus },
  { title: 'Data downloaded', renderer: DeploymentSize }
];

const type = DEPLOYMENT_STATES.finished;

const useStyles = makeStyles()(theme => ({
  datepickerContainer: {
    backgroundColor: theme.palette.background.lightgrey
  }
}));

export const Past = props => {
  const { createClick, isShowingDetails } = props;
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const [tonight] = useState(getISOStringBoundaries(new Date()).end);
  const [loading, setLoading] = useState(false);
  const deploymentsRef = useRef();
  const timer = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [typeValue, setTypeValue] = useState('');
  const { classes } = useStyles();

  const dispatch = useDispatch();
  const dispatchedSetSnackbar = (...args) => dispatch(setSnackbar(...args));

  const past = useSelector(state => state.deployments.selectionState.finished.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments);
  const groups = useSelector(state => {
    // eslint-disable-next-line no-unused-vars
    const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
    return [ALL_DEVICES, ...Object.keys(groups)];
  });
  const { canConfigure, canDeploy } = useSelector(getUserCapabilities);
  const { attribute: idAttribute } = useSelector(getIdAttribute);
  const onboardingState = useSelector(getOnboardingState);
  const pastSelectionState = useSelector(state => state.deployments.selectionState.finished);
  const devices = useSelector(state => state.devices.byId);

  const debouncedSearch = useDebounce(searchValue, TIMEOUTS.debounceDefault);
  const debouncedType = useDebounce(typeValue, TIMEOUTS.debounceDefault);

  const { endDate, page, perPage, search: deviceGroup, startDate, total: count, type: deploymentType } = pastSelectionState;

  useEffect(() => {
    const roundedStartDate = Math.round(Date.parse(startDate || BEGINNING_OF_TIME) / 1000);
    const roundedEndDate = Math.round(Date.parse(endDate) / 1000);
    setLoading(true);
    dispatch(getDeploymentsByStatus(type, page, perPage, roundedStartDate, roundedEndDate, deviceGroup, deploymentType, true, SORTING_OPTIONS.desc))
      .then(deploymentsAction => {
        const deploymentsList = deploymentsAction ? Object.values(deploymentsAction[0].deployments) : [];
        if (deploymentsList.length) {
          let newStartDate = new Date(deploymentsList[deploymentsList.length - 1].created);
          const { start: startDate } = getISOStringBoundaries(newStartDate);
          dispatch(setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { startDate } }));
        }
      })
      .finally(() => setLoading(false));
    return () => {
      clearAllRetryTimers(dispatchedSetSnackbar);
    };
  }, []);

  useEffect(() => {
    clearInterval(timer.current);
    timer.current = setInterval(refreshPast, refreshDeploymentsLength);
    refreshPast();
    return () => {
      clearInterval(timer.current);
    };
  }, [page, perPage, startDate, endDate, deviceGroup, deploymentType]);

  useEffect(() => {
    if (!past.length || onboardingState.complete) {
      return;
    }
    const pastDeploymentsFailed = past.reduce(
      (accu, item) =>
        item.status === 'failed' ||
        (item.statistics?.status &&
          item.statistics.status.noartifact + item.statistics.status.failure + item.statistics.status['already-installed'] + item.statistics.status.aborted >
            0) ||
        accu,
      false
    );
    let onboardingStep = onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION;
    if (pastDeploymentsFailed) {
      onboardingStep = onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE;
    }
    dispatch(advanceOnboarding(onboardingStep));
    setTimeout(() => {
      let notification = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION, onboardingState, {
        setSnackbar: dispatchedSetSnackbar
      });
      // the following extra check is needed since this component will still be mounted if a user returns to the initial tab after the first
      // onboarding deployment & thus the effects will still run, so only ever consider the notification for the second deployment
      notification =
        past.length > 1
          ? getOnboardingComponentFor(onboardingSteps.ONBOARDING_FINISHED_NOTIFICATION, onboardingState, { setSnackbar: dispatchedSetSnackbar }, notification)
          : notification;
      !!notification && dispatch(setSnackbar('open', TIMEOUTS.refreshDefault, '', notification, () => {}, true));
    }, 400);
  }, [past.length, onboardingState.complete]);

  useEffect(() => {
    dispatch(setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { page: 1, search: debouncedSearch, type: debouncedType } }));
  }, [debouncedSearch, debouncedType]);

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
    const roundedStartDate = Math.round(Date.parse(currentStartDate) / 1000);
    const roundedEndDate = Math.round(Date.parse(currentEndDate) / 1000);
    return dispatch(getDeploymentsByStatus(type, currentPage, currentPerPage, roundedStartDate, roundedEndDate, currentDeviceGroup, currentType))
      .then(deploymentsAction => {
        clearRetryTimer(type, dispatchedSetSnackbar);
        const { total, deploymentIds } = deploymentsAction[deploymentsAction.length - 1];
        if (total && !deploymentIds.length) {
          return refreshPast(currentPage, currentPerPage, currentStartDate, currentEndDate, currentDeviceGroup);
        }
      })
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, dispatchedSetSnackbar));
  };

  let onboardingComponent = null;
  if (deploymentsRef.current) {
    const detailsButtons = deploymentsRef.current.getElementsByClassName('MuiButton-contained');
    const left = detailsButtons.length
      ? deploymentsRef.current.offsetLeft + detailsButtons[0].offsetLeft + detailsButtons[0].offsetWidth / 2 + 15
      : deploymentsRef.current.offsetWidth;
    let anchor = { left: deploymentsRef.current.offsetWidth / 2, top: deploymentsRef.current.offsetTop };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, {
      anchor,
      setSnackbar: dispatchedSetSnackbar
    });
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE,
      onboardingState,
      { anchor: { left, top: detailsButtons[0].parentElement.offsetTop + detailsButtons[0].parentElement.offsetHeight } },
      onboardingComponent
    );
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.ONBOARDING_FINISHED, onboardingState, { anchor }, onboardingComponent);
  }

  const onGroupFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setSearchValue(value);
  };

  const onTypeFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setTypeValue(value);
  };

  const onTimeFilterChange = (startDate, endDate) => dispatch(setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { page: 1, startDate, endDate } }));

  return (
    <div className="fadeIn margin-left margin-top-large">
      <div className={`datepicker-container ${classes.datepickerContainer}`}>
        <TimerangePicker endDate={endDate} onChange={onTimeFilterChange} startDate={startDate} />
        <TimeframePicker onChange={onTimeFilterChange} endDate={endDate} startDate={startDate} tonight={tonight} />
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
        {!loading && !!past.length && !!onboardingComponent && !isShowingDetails && onboardingComponent}
        {!!past.length && (
          <DeploymentsList
            {...props}
            canConfigure={canConfigure}
            canDeploy={canDeploy}
            devices={devices}
            idAttribute={idAttribute}
            componentClass="margin-left-small"
            count={count}
            headers={headers}
            items={past}
            page={page}
            onChangeRowsPerPage={perPage => dispatch(setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { page: 1, perPage } }))}
            onChangePage={page => dispatch(setDeploymentsState({ [DEPLOYMENT_STATES.finished]: { page } }))}
            pageSize={perPage}
            rootRef={deploymentsRef}
            showPagination
            type={type}
          />
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

export default Past;
