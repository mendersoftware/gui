import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import historyImage from '../../../assets/img/history.png';

import { getAuditLogs, getAuditLogsCsvLink } from '../../actions/organizationActions';
import { getUserList } from '../../actions/userActions';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import AuditLogsList, { defaultRowsPerPage } from './auditlogslist';

const today = new Date(new Date().setHours(0, 0, 0));
const tonight = new Date(new Date().setHours(23, 59, 59));

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

export const AuditLogs = ({ events, getAuditLogsCsvLink, getAuditLogs, getUserList, groups, users, ...props }) => {
  const [csvLoading, setCsvLoading] = useState(false);
  const [detail, setDetail] = useState('');
  const [endDate, setEndDate] = useState(tonight);
  const [filterReset, setFilterReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultRowsPerPage);
  const [sorting, setSorting] = useState('desc');
  const [startDate, setStartDate] = useState(today);
  const [type, setType] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    getUserList();
  }, []);

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page, perPage, startDate, endDate, user?.id || user, `${type}`.toLowerCase(), detail?.id || detail, sorting).then(() => setLoading(false));
  }, [page, perPage, endDate, startDate, user, type, detail, sorting]);

  const reset = () => {
    setPage(1);
    setStartDate(today);
    setEndDate(tonight);
    setUser('');
    setType('');
    setDetail('');
    setFilterReset(!filterReset);
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
    setPage(currentPage);
    setPerPage(currentPerPage);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setUser(userFilter);
    setType(typeFilter);
    setDetail(detailFilter);
  };

  const createCsvDownload = () => {
    setCsvLoading(true);
    getAuditLogsCsvLink().then(address => {
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(address));
      link.setAttribute('download', `Mender-AuditLog-${moment(startDate).format(moment.HTML5_FMT.DATE)}-${moment(endDate).format(moment.HTML5_FMT.DATE)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCsvLoading(false);
    });
  };

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
          options={type === 'Deployment' ? groups : Object.values(users)}
          renderInput={params => <TextField {...params} placeholder={detailsMap[type] || '-'} InputProps={{ ...params.InputProps }} />}
          renderOption={option => option.email || option}
          style={{ marginRight: 15, marginTop: 16 }}
        />
        <div />
        <TimerangePicker onChange={(start, end) => refresh(1, perPage, start, end)} reset={filterReset} />
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
      <div className="flexbox" style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Loader show={csvLoading} />
        <Button variant="contained" color="secondary" disabled={csvLoading || !events.length} onClick={createCsvDownload} style={{ marginLeft: 15 }}>
          Download results as csv
        </Button>
      </div>
      {!!events.length && (
        <AuditLogsList
          {...props}
          items={events}
          loading={loading}
          onChangePage={refresh}
          onChangeRowsPerPage={newPerPage => refresh(1, newPerPage)}
          onChangeSorting={() => setSorting(sorting === 'desc' ? 'asc' : 'desc')}
          page={page}
          perPage={perPage}
          sortDirection={sorting}
        />
      )}
      {!(loading || events.length) && (
        <div className="dashboard-placeholder">
          <p>No log entries were found.</p>
          <p>Try a different date range.</p>
          <img src={historyImage} alt="Past" />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getAuditLogs, getAuditLogsCsvLink, getUserList };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    count: state.organization.eventsTotal || state.organization.events.length,
    events: state.organization.events,
    groups: ['All devices', ...Object.keys(groups).sort()],
    users: state.users.byId
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
