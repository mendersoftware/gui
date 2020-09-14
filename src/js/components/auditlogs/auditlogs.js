import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { getAuditLogs } from '../../actions/organizationActions';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import TimeframePicker from '../common/timeframe-picker';
import TimerangePicker from '../common/timerange-picker';
import AuditLogsList, { defaultRowsPerPage } from './auditlogslist';

const today = new Date(new Date().setHours(0, 0, 0));
const tonight = new Date(new Date().setHours(23, 59, 59));

export const AuditLogs = ({ count, events, getAuditLogs, groups, users }) => {
  const [endDate, setEndDate] = useState(endDate || tonight);
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultRowsPerPage);
  const [startDate, setStartDate] = useState(startDate || today);
  const [type, setType] = useState('');
  const [user, setUser] = useState('');
  const [sorting, setSorting] = useState('desc');

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page, perPage, endDate, startDate, user, type, group, sorting).then(() => setLoading(false));
  }, [page, perPage, endDate, startDate, user, type, group, sorting]);

  const refresh = (
    currentPage,
    currentPerPage,
    currentStartDate = startDate,
    currentEndDate = endDate,
    userFilter = user,
    typeFilter = type,
    groupFilter = group
  ) => {
    setPage(currentPage);
    setPerPage(currentPerPage);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setUser(userFilter);
    setType(typeFilter);
    setGroup(groupFilter);
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
          getOptionLabel={option => option.email}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, value)}
          renderInput={params => <TextField {...params} label="Filter by user" placeholder="Select a user" InputProps={{ ...params.InputProps }} />}
          renderOption={option => option.email}
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
          renderInput={params => <TextField {...params} label="Filter by change type" InputProps={{ ...params.InputProps }} />}
          renderOption={option => option.title}
          style={{ marginLeft: 7.5 }}
        />
        <Autocomplete
          id="audit-log-type-details-selection"
          autoSelect
          filterSelectedOptions
          handleHomeEndKeys
          inputValue={group}
          options={groups}
          disabled={!type}
          onInputChange={(e, value) => refresh(1, perPage, startDate, endDate, user, type, value)}
          renderInput={params => <TextField {...params} label="To device group" InputProps={{ ...params.InputProps }} />}
          style={{ marginRight: 15 }}
        />
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
      </div>
      <Button variant="contained" color="secondary" style={{ alignSelf: 'flex-end' }}>
        Download as csv
      </Button>
      {!!events.length && (
        <AuditLogsList
          {...self.props}
          componentClass="margin-left-small"
          count={count}
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

const actionCreators = { getAuditLogs };

const mapStateToProps = state => {
  return {
    count: state.organization.eventsTotal || state.organization.events.length,
    events: state.organization.events,
    groups: Object.keys(state.devices.groups.byId).sort(),
    users: Object.values(state.users.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(AuditLogs);
