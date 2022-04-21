import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Button, TextField, Autocomplete } from '@mui/material';

import historyImage from '../../../assets/img/history.png';

import { getAuditLogsCsvLink, setAuditlogsState } from '../../actions/organizationActions';
import { getUserList } from '../../actions/userActions';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import AuditLogsList, { defaultRowsPerPage } from './auditlogslist';
import { createDownload } from '../../helpers';
import { useDebounce } from '../../utils/debouncehook';

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

const getOptionLabel = option => option.title || option.email || option;

const renderOption = (props, option) => <li {...props}>{getOptionLabel(option)}</li>;

const autoSelectProps = {
  autoSelect: true,
  filterSelectedOptions: true,
  getOptionLabel,
  handleHomeEndKeys: true,
  renderOption
};

export const AuditLogs = ({ events, getAuditLogsCsvLink, getUserList, groups, selectionState, setAuditlogsState, users, ...props }) => {
  const history = useHistory();
  const [csvLoading, setCsvLoading] = useState(false);
  const [locationChange, setLocationChange] = useState(true);
  const [filterReset, setFilterReset] = useState(false);
  const [date] = useState({ today: new Date(new Date().setHours(0, 0, 0)).toISOString(), tonight: new Date(new Date().setHours(23, 59, 59)).toISOString() });
  const { today, tonight } = date;

  const [detailValue, setDetailValue] = useState('');
  const [userValue, setUserValue] = useState('');
  const [typeValue, setTypeValue] = useState('');

  const debouncedDetail = useDebounce(detailValue, 700);
  const debouncedType = useDebounce(typeValue, 700);
  const debouncedUser = useDebounce(userValue, 700);

  useEffect(() => {
    setAuditlogsState({ page: 1, detail: debouncedDetail, type: debouncedType, user: debouncedUser });
  }, [debouncedDetail, debouncedType, debouncedUser]);

  const { detail, isLoading, perPage, endDate, user, reset: resetList, sort, startDate, total, type } = selectionState;

  useEffect(() => {
    getUserList();
    setAuditlogsState({ reset: !resetList });
    trackLocationChange(history.location);
    history.listen(trackLocationChange);
  }, []);

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
      sort: params.get('sort') || SORTING_OPTIONS.desc,
      startDate: params.get('start_date') ?? today,
      endDate: params.get('end_date') ?? tonight
    };
    setAuditlogsState(state);
    setLocationChange(!locationChange);
  };

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
    setFilterReset(!filterReset);
    history.push('/auditlog');
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
    const currentSorting = sort === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    setAuditlogsState({ page: 1, sort: currentSorting });
  };

  const onUserFilterChange = (e, value, reason) => {
    if (!e || reason === 'blur') {
      return;
    }
    setUserValue(value);
  };

  const onTypeFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setTypeValue(value);
  };

  const onDetailFilterChange = (e, value) => {
    if (!e) {
      return;
    }
    setDetailValue(value);
  };

  const onTimeFilterChange = (currentStartDate = startDate, currentEndDate = endDate) =>
    setAuditlogsState({ page: 1, startDate: currentStartDate, endDate: currentEndDate });

  const onChangePagination = (page, currentPerPage = perPage) => setAuditlogsState({ page, perPage: currentPerPage });

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
          inputValue={type}
          onInputChange={onTypeFilterChange}
          options={AUDIT_LOGS_TYPES}
          renderInput={params => (
            <TextField {...params} label="Filter by change" placeholder="Type" InputLabelProps={{ shrink: true }} InputProps={{ ...params.InputProps }} />
          )}
          style={{ marginLeft: 7.5 }}
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
        <div style={{ gridColumnStart: 2, gridColumnEnd: 4, marginLeft: -7.5 }}>
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
          locationChange={locationChange}
          onChangePage={onChangePagination}
          onChangeRowsPerPage={newPerPage => onChangePagination(1, newPerPage)}
          onChangeSorting={onChangeSorting}
          selectionState={selectionState}
          setAuditlogsState={setAuditlogsState}
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
    selectionState: state.organization.auditlog.selectionState,
    groups: [ALL_DEVICES, ...Object.keys(groups).sort()],
    users: state.users.byId
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
