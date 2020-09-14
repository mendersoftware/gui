import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { getAllAuditLogs, getAuditLogs } from '../../actions/organizationActions';
import Loader from '../common/loader';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import AuditLogsList, { auditLogColumns, defaultRowsPerPage } from './auditlogslist';

const today = new Date(new Date().setHours(0, 0, 0));
const tonight = new Date(new Date().setHours(23, 59, 59));

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

const csvHeader = `data:text/csv;charset=utf-8,${auditLogColumns.map(column => column.title).join(',')}`;

export const AuditLogs = ({ events, getAllAuditLogs, getAuditLogs, groups, users }) => {
  const [endDate, setEndDate] = useState(endDate || tonight);
  const [csvLoading, setCsvLoading] = useState(false);
  const [detail, setDetail] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultRowsPerPage);
  const [startDate, setStartDate] = useState(startDate || today);
  const [type, setType] = useState('');
  const [user, setUser] = useState('');
  const [sorting, setSorting] = useState('desc');

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page, perPage, endDate, startDate, user, type, detail, sorting).then(() => setLoading(false));
  }, [page, perPage, endDate, startDate, user, type, detail, sorting]);

  const reset = () => {
    setPage(1);
    setStartDate(today);
    setEndDate(tonight);
    setUser('');
    setType('');
    setDetail('');
  };

  const refresh = (
    currentPage,
    currentPerPage,
    currentStartDate = startDate,
    currentEndDate = endDate,
    userFilter = user,
    typeFilter = type,
    detailFilter = detail
  ) => {
    setPage(currentPage);
    setPerPage(currentPerPage);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setUser(userFilter);
    setType(typeFilter);
    setDetail(detailFilter);
  };

  const applyFormatting = (entries, columns) => entries.map(entry => columns.map(column => column.printFormatter(entry)).join(','));

  const createCsvDownload = () => {
    setCsvLoading(true);
    getAllAuditLogs().then(entries => {
      const rows = applyFormatting(entries, auditLogColumns);
      const csvContent = rows.join('\n');
      const encodedUri = encodeURI(`${csvHeader}\n${csvContent}`);
      // window.open(encodedUri);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Mender-AuditLog-${moment(startDate).format(moment.HTML5_FMT.DATE)}-${moment(endDate).format(moment.HTML5_FMT.DATE)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCsvLoading(false);
    });
  };

  const availableChangeTypes = AUDIT_LOGS_TYPES; // || AUDIT_LOGS_TYPES.filter(type => events.some(e => e.type === type));

  return (
    <div className="fadeIn margin-left margin-top-large flexbox column" style={{ marginRight: '5%' }}>
      <h3>Audit log</h3>
      <div className="auditlogs-filters margin-bottom">
        <Autocomplete
          id="audit-log-user-selection"
          autoSelect
          freeSolo
          filterSelectedOptions
          handleHomeEndKeys
          inputValue={user}
          options={users}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, value)}
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
          id="audit-log-type-selection"
          autoSelect
          filterSelectedOptions
          handleHomeEndKeys
          inputValue={type}
          options={availableChangeTypes}
          getOptionLabel={option => option.title}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, user, value)}
          renderInput={params => (
            <TextField {...params} label="Filter by change" placeholder="Type" InputLabelProps={{ shrink: true }} InputProps={{ ...params.InputProps }} />
          )}
          renderOption={option => option.title}
          style={{ marginLeft: 7.5 }}
        />
        <Autocomplete
          id="audit-log-type-details-selection"
          autoSelect
          filterSelectedOptions
          handleHomeEndKeys
          inputValue={detail}
          options={type === 'Deployment' ? groups : users}
          disabled={!type}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, user, type, value)}
          renderInput={params => <TextField {...params} placeholder={detailsMap[type] || '-'} InputProps={{ ...params.InputProps }} />}
          style={{ marginRight: 15, marginTop: 16 }}
        />
        <div />
        <TimerangePicker onChange={(start, end) => refresh(1, perPage, start, end)} />
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
        <Button variant="contained" color="secondary" disabled={csvLoading} onClick={createCsvDownload} style={{ marginLeft: 15 }}>
          Download results as csv
        </Button>
      </div>
      {!!events.length && (
        <AuditLogsList
          {...self.props}
          componentClass="margin-left-small"
          items={events}
          loading={loading}
          page={page}
          onChangeRowsPerPage={newPerPage => refresh(1, newPerPage)}
          onChangePage={refresh}
          onChangeSorting={() => setSorting(sorting === 'desc' ? 'asc' : 'desc')}
          pageSize={perPage}
          sortDirection={sorting}
        />
      )}
      {!(loading || events.length) && (
        <div className="dashboard-placeholder">
          <p>No auditlogs entries were found.</p>
          <p>Try a different date range.</p>
          <img src="assets/img/history.png" alt="Past" />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getAllAuditLogs, getAuditLogs };

const mapStateToProps = state => {
  return {
    count: state.organization.eventsTotal || state.organization.events.length,
    events: state.organization.events,
    groups: Object.keys(state.devices.groups.byId).sort(),
    users: Object.values(state.users.byId).map(user => user.email)
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
