import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import historyImage from '../../../assets/img/history.png';

import { getAuditLogs, getAuditLogsCsvLink, setAuditlogsState } from '../../actions/organizationActions';
import { getUserList } from '../../actions/userActions';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import AuditLogsList, { defaultRowsPerPage } from './auditlogslist';

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

export const AuditLogs = ({ events, getAuditLogsCsvLink, getAuditLogs, getUserList, groups, selectionState, setAuditlogsState, users, ...props }) => {
  const history = useHistory();
  const [csvLoading, setCsvLoading] = useState(false);
  const [filterReset, setFilterReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationChange, setLocationChange] = useState(true);
  const [toggleActiveRange, setToggleActiveRange] = useState(false);
  const [date] = useState({ today: new Date(new Date().setHours(0, 0, 0)).toISOString(), tonight: new Date(new Date().setHours(23, 59, 59)).toISOString() });
  const { today, tonight } = date;

  const { detail, page, perPage, endDate, user, sorting, startDate, total, type } = selectionState;

  useEffect(() => {
    setToggleActiveRange(endDate || startDate);
    getUserList();
    trackLocationChange(history.location);
    history.listen(trackLocationChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page, perPage, startDate, endDate, user?.id || user, `${type}`.toLowerCase(), detail?.id || detail, sorting).then(() => setLoading(false));
  }, [page, perPage, endDate, startDate, user, type, detail, sorting]);

  const trackLocationChange = location => {
    if (!location.search) {
      return;
    }
    const params = new URLSearchParams(location.search);
    const { title: type = '' } = AUDIT_LOGS_TYPES.find(typeObject => typeObject.value === params.get('object_type')) || {};
    let state = {
      page: params.get('page') || 1,
      perPage: params.get('per_page') || defaultRowsPerPage,
      type,
      detail: params.get('object_id') || '',
      user: params.get('user_id') || '',
      sorting: params.get('sort') || SORTING_OPTIONS.desc,
      startDate: params.get('start_date') ?? today,
      endDate: params.get('end_date') ?? tonight
    };
    setAuditlogsState(state);
    setLocationChange(!locationChange);
  };

  const reset = () => {
    setAuditlogsState({
      page: 1,
      type: '',
      detail: '',
      user: '',
      startDate: today,
      endDate: tonight
    });
    setFilterReset(!filterReset);
    history.push('/auditlog');
  };

  const refresh = (
    currentPage,
    currentPerPage = perPage,
    currentStartDate = startDate,
    currentEndDate = endDate,
    userFilter = user,
    typeFilter = type,
    detailFilter
  ) => {
    detailFilter = !detailFilter && typeof detailFilter === 'string' ? '' : detailFilter || detail;
    setAuditlogsState({
      page: currentPage,
      perPage: currentPerPage,
      type: typeFilter,
      detail: detailFilter,
      user: userFilter,
      startDate: currentStartDate?.toISOString ? currentStartDate.toISOString() : currentStartDate,
      endDate: currentEndDate?.toISOString ? currentEndDate.toISOString() : currentEndDate
    });
  };

  const createCsvDownload = () => {
    setCsvLoading(true);
    getAuditLogsCsvLink(startDate, endDate, user?.id || user, `${type}`.toLowerCase(), detail?.id || detail, sorting).then(address => {
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(address));
      link.setAttribute('download', `Mender-AuditLog-${moment(startDate).format(moment.HTML5_FMT.DATE)}-${moment(endDate).format(moment.HTML5_FMT.DATE)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCsvLoading(false);
    });
  };

  const onChangeSorting = () => setAuditlogsState({ sorting: sorting === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc });

  const typeOptionsMap = {
    Deployment: groups,
    User: Object.values(users),
    Device: []
  };
  let detailOptions = typeOptionsMap[type] ?? [];

  return (
    <div className="fadeIn margin-left flexbox column" style={{ marginRight: '5%' }}>
      <h3>Audit log</h3>
      <div className="auditlogs-filters margin-bottom margin-top-small">
        <Autocomplete
          id="audit-log-user-selection"
          autoSelect
          freeSolo
          filterSelectedOptions
          getOptionLabel={option => option.email || option}
          handleHomeEndKeys
          options={Object.values(users)}
          onChange={(e, value, reason) => (reason !== 'blur' ? refresh(1, perPage, startDate, endDate, value) : null)}
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
          renderOption={option => option.email || option}
          style={{ maxWidth: 250 }}
        />
        <Autocomplete
          id="audit-log-type-selection"
          key={`audit-log-type-selection-${filterReset}`}
          autoSelect
          filterSelectedOptions
          getOptionLabel={option => option.title || option}
          handleHomeEndKeys
          inputValue={type}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, user, value, '')}
          options={AUDIT_LOGS_TYPES}
          renderInput={params => (
            <TextField {...params} label="Filter by change" placeholder="Type" InputLabelProps={{ shrink: true }} InputProps={{ ...params.InputProps }} />
          )}
          renderOption={option => option.title}
          style={{ marginLeft: 7.5 }}
        />
        <Autocomplete
          id="audit-log-type-details-selection"
          autoSelect
          disabled={!type}
          filterSelectedOptions
          getOptionLabel={option => option.email || option}
          handleHomeEndKeys
          inputValue={detail}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, user, type, value)}
          options={detailOptions}
          renderInput={params => <TextField {...params} placeholder={detailsMap[type] || '-'} InputProps={{ ...params.InputProps }} />}
          renderOption={option => option.email || option}
          style={{ marginRight: 15, marginTop: 16 }}
        />
        <div />
        <TimerangePicker onChange={(start, end) => refresh(1, perPage, start, end)} reset={filterReset} toggleActive={toggleActiveRange} />
        <div style={{ gridColumnStart: 2, gridColumnEnd: 4 }}>
          <TimeframePicker
            classNames="margin-left margin-right inline-block"
            onChange={(startDate, endDate) => refresh(1, perPage, startDate, endDate)}
            endDate={endDate}
            startDate={startDate}
            tonight={tonight}
          />
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
          loading={loading}
          locationChange={locationChange}
          onChangePage={refresh}
          onChangeRowsPerPage={newPerPage => refresh(1, newPerPage)}
          onChangeSorting={onChangeSorting}
          selectionState={selectionState}
          setAuditlogsState={setAuditlogsState}
        />
      )}
      {!(loading || total) && (
        <div className="dashboard-placeholder">
          <p>No log entries were found.</p>
          <p>Try adjusting the filters.</p>
          <img src={historyImage} alt="Past" />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getAuditLogs, getAuditLogsCsvLink, getUserList, setAuditlogsState };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    events: state.organization.auditlog.events,
    selectionState: state.organization.auditlog.selectionState,
    groups: ['All devices', ...Object.keys(groups).sort()],
    users: state.users.byId
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
