// Copyright 2020 Northern.tech AS
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
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Autocomplete, Button, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import moment from 'moment';

import historyImage from '../../../assets/img/history.png';
import { getAuditLogsCsvLink, setAuditlogsState } from '../../actions/organizationActions';
import { getUserList } from '../../actions/userActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import { createDownload, getISOStringBoundaries, toggle } from '../../helpers';
import { getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import { useLocationParams } from '../../utils/liststatehook';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import AuditLogsList from './auditlogslist';

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

const useStyles = makeStyles()(theme => ({
  filters: {
    backgroundColor: theme.palette.background.lightgrey
  }
}));

const getOptionLabel = option => option.title || option.email || option;

const renderOption = (props, option) => <li {...props}>{getOptionLabel(option)}</li>;

const autoSelectProps = {
  autoSelect: true,
  filterSelectedOptions: true,
  getOptionLabel,
  handleHomeEndKeys: true,
  renderOption
};

export const AuditLogs = ({
  events,
  getAuditLogsCsvLink,
  getUserList,
  groups,
  selectionState,
  setAuditlogsState,
  tenantCapabilities,
  userCapabilities,
  users,
  ...props
}) => {
  const navigate = useNavigate();
  const [csvLoading, setCsvLoading] = useState(false);
  const [filterReset, setFilterReset] = useState(false);

  const [date] = useState(getISOStringBoundaries(new Date()));
  const { start: today, end: tonight } = date;

  const [detailValue, setDetailValue] = useState('');
  const [userValue, setUserValue] = useState('');
  const [typeValue, setTypeValue] = useState('');
  const [locationParams, setLocationParams] = useLocationParams('auditlogs', { today, tonight, defaults: { sort: { direction: SORTING_OPTIONS.desc } } });
  const { canReadUsers } = userCapabilities;
  const { hasAuditlogs } = tenantCapabilities;
  const { classes } = useStyles();

  const debouncedDetail = useDebounce(detailValue, TIMEOUTS.debounceDefault);
  const debouncedType = useDebounce(typeValue, TIMEOUTS.debounceDefault);
  const debouncedUser = useDebounce(userValue, TIMEOUTS.debounceDefault);

  const { detail, isLoading, perPage, endDate, user, reset: resetList, sort, startDate, total, type } = selectionState;

  useEffect(() => {
    if (!hasAuditlogs) {
      return;
    }
    let state = { ...locationParams, reset: !resetList };
    if (locationParams.id && Boolean(locationParams.open)) {
      state.selectedId = locationParams.id[0];
      const [eventAction, eventTime] = atob(state.selectedId).split('|');
      if (eventTime && !events.some(item => item.time === eventTime && item.action === eventAction)) {
        const { start, end } = getISOStringBoundaries(new Date(eventTime));
        state.endDate = end;
        state.startDate = start;
      }
    }
    setAuditlogsState(state);
    Object.entries({ detail: setDetailValue, user: setUserValue, type: setTypeValue }).map(([key, setter]) => (state[key] ? setter(state[key]) : undefined));
  }, [hasAuditlogs]);

  useEffect(() => {
    if (!hasAuditlogs) {
      return;
    }
    setAuditlogsState({ page: 1, detail: debouncedDetail, type: debouncedType, user: debouncedUser });
  }, [debouncedDetail, debouncedType, debouncedUser, hasAuditlogs]);

  useEffect(() => {
    if (canReadUsers) {
      getUserList();
    }
  }, [canReadUsers]);

  useEffect(() => {
    if (!hasAuditlogs) {
      return;
    }
    setLocationParams({ pageState: selectionState });
  }, [detail, endDate, hasAuditlogs, JSON.stringify(sort), perPage, selectionState.page, selectionState.selectedId, startDate, type, user]);

  const reset = () => {
    setAuditlogsState({
      detail: '',
      endDate: tonight,
      page: 1,
      reset: !resetList,
      startDate: today,
      type: '',
      user: ''
    });
    setFilterReset(toggle);
    navigate('/auditlog');
  };

  const createCsvDownload = () => {
    setCsvLoading(true);
    getAuditLogsCsvLink().then(address => {
      createDownload(
        encodeURI(address),
        `Mender-AuditLog-${moment(startDate).format(moment.HTML5_FMT.DATE)}-${moment(endDate).format(moment.HTML5_FMT.DATE)}.csv`
      );
      setCsvLoading(false);
    });
  };

  const onChangeSorting = () => {
    const currentSorting = sort.direction === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    setAuditlogsState({ page: 1, sort: { direction: currentSorting } });
  };

  const onUserFilterChange = (e, value, reason) => {
    if (!e || reason === 'blur') {
      return;
    }
    setUserValue(value || '');
  };

  const onTypeFilterChange = (e, value, reason) => {
    if (!e || reason === 'blur') {
      return;
    }
    if (!value) {
      setDetailValue('');
    }
    setTypeValue(value || '');
  };

  const onDetailFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setDetailValue(value || '');
  };

  const onTimeFilterChange = (currentStartDate = startDate, currentEndDate = endDate) =>
    setAuditlogsState({ page: 1, startDate: currentStartDate, endDate: currentEndDate });

  const onChangePagination = (page, currentPerPage = perPage) => setAuditlogsState({ page, perPage: currentPerPage });

  const typeOptionsMap = {
    Deployment: groups,
    User: Object.values(users),
    Device: []
  };
  const detailOptions = typeOptionsMap[type?.title] ?? [];

  return (
    <div className="fadeIn margin-left flexbox column" style={{ marginRight: '5%' }}>
      <h3>Audit log</h3>
      <div className={`auditlogs-filters margin-bottom margin-top-small ${classes.filters}`}>
        <Autocomplete
          {...autoSelectProps}
          id="audit-log-user-selection"
          freeSolo
          options={Object.values(users)}
          onChange={onUserFilterChange}
          value={user}
          renderInput={params => (
            <TextField
              {...params}
              label="Filter by user"
              placeholder="Select a user"
              InputLabelProps={{ shrink: true }}
              InputProps={{ ...params.InputProps }}
            />
          )}
          style={{ maxWidth: 250 }}
        />
        <Autocomplete
          {...autoSelectProps}
          id="audit-log-type-selection"
          key={`audit-log-type-selection-${filterReset}`}
          onChange={onTypeFilterChange}
          options={AUDIT_LOGS_TYPES}
          renderInput={params => (
            <TextField {...params} label="Filter by change" placeholder="Type" InputLabelProps={{ shrink: true }} InputProps={{ ...params.InputProps }} />
          )}
          style={{ marginLeft: 7.5 }}
          value={type}
        />
        <Autocomplete
          {...autoSelectProps}
          id="audit-log-type-details-selection"
          disabled={!type}
          inputValue={detail}
          onInputChange={onDetailFilterChange}
          options={detailOptions}
          renderInput={params => <TextField {...params} placeholder={detailsMap[type] || '-'} InputProps={{ ...params.InputProps }} />}
          style={{ marginRight: 15, marginTop: 16 }}
        />
        <div />
        <TimerangePicker endDate={endDate} onChange={onTimeFilterChange} startDate={startDate} />
        <div style={{ gridColumnStart: 2, gridColumnEnd: 4, marginLeft: 7.5 }}>
          <TimeframePicker onChange={onTimeFilterChange} endDate={endDate} startDate={startDate} tonight={tonight} />
        </div>
        {!!(user || type || detail || startDate !== today || endDate !== tonight) && (
          <span className="link margin-bottom-small" onClick={reset} style={{ alignSelf: 'flex-end' }}>
            clear filter
          </span>
        )}
      </div>
      <div className="flexbox center-aligned" style={{ justifyContent: 'flex-end' }}>
        <Loader show={csvLoading} />
        <Button variant="contained" color="secondary" disabled={csvLoading || !total} onClick={createCsvDownload} style={{ marginLeft: 15 }}>
          Download results as csv
        </Button>
      </div>
      {!!total && (
        <AuditLogsList
          {...props}
          items={events}
          loading={isLoading}
          onChangePage={onChangePagination}
          onChangeRowsPerPage={newPerPage => onChangePagination(1, newPerPage)}
          onChangeSorting={onChangeSorting}
          selectionState={selectionState}
          setAuditlogsState={setAuditlogsState}
          userCapabilities={userCapabilities}
        />
      )}
      {!(isLoading || total) && (
        <div className="dashboard-placeholder">
          <p>No log entries were found.</p>
          <p>Try adjusting the filters.</p>
          <img src={historyImage} alt="Past" />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getAuditLogsCsvLink, getUserList, setAuditlogsState };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    events: state.organization.auditlog.events,
    groups: [ALL_DEVICES, ...Object.keys(groups).sort()],
    selectionState: state.organization.auditlog.selectionState,
    userCapabilities: getUserCapabilities(state),
    tenantCapabilities: getTenantCapabilities(state),
    users: state.users.byId
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
