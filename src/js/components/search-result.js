// Copyright 2022 Northern.tech AS
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

import { Close as CloseIcon } from '@mui/icons-material';
// material ui
import { Drawer, IconButton, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';

import { setSearchState, setSnackbar } from '../actions/appActions';
import { setDeviceListState } from '../actions/deviceActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../constants/appConstants';
import { getIdAttribute, getMappedDevicesList, getOnboardingState, getUserSettings } from '../selectors';
import { getHeaders } from './devices/authorized-devices';
import { routes } from './devices/base-devices';
import Devicelist from './devices/devicelist';

const useStyles = makeStyles()(theme => ({
  drawerOffset: {
    top: theme.mixins.toolbar.minHeight + 1,
    left: 200
  },
  paper: {
    maxWidth: '100vw',
    minHeight: '20vh',
    boxShadow: 'none'
  }
}));

const leftNavOffset = 500;
const ResultTitle = ({ onClick, term, total }) => {
  const content = `${total ? total : 'No'} ${pluralize('device', total)} found for "${term}"`;
  let props = { className: 'bold' };
  let style = {};
  if (!total) {
    props = { className: 'info' };
    style = { width: `calc(100% - ${leftNavOffset}px)` };
  }
  return (
    <div className={`flexbox ${total ? 'center-aligned' : 'centered'}`} style={style}>
      <Typography variant="body2" {...props}>
        {content}
      </Typography>
      <a className="margin-left-large" onClick={onClick}>
        clear search
      </a>
    </div>
  );
};

export const SearchResult = ({
  columnSelection,
  customColumnSizes,
  devices,
  idAttribute,
  onboardingState,
  onToggleSearchResult,
  open = true,
  searchState,
  setDeviceListState,
  setSearchState,
  setSnackbar
}) => {
  const navigate = useNavigate();

  const { classes } = useStyles();

  const [columnHeaders, setColumnHeaders] = useState(getHeaders(columnSelection, routes.devices.defaultHeaders, idAttribute));

  const { isSearching, searchTerm, searchTotal, sort = {} } = searchState;
  const { direction: sortDown = SORTING_OPTIONS.desc, key: sortCol } = sort;

  useEffect(() => {
    const columnHeaders = getHeaders(columnSelection, routes.devices.defaultHeaders, idAttribute);
    setColumnHeaders(columnHeaders);
  }, [columnSelection, idAttribute.attribute]);

  useEffect(() => {
    if (!open && isSearching) {
      onToggleSearchResult();
    }
  }, [open, isSearching]);

  useEffect(() => {
    if (open && !searchTerm) {
      onToggleSearchResult();
    }
  }, [open, searchTerm]);

  const onDeviceSelect = device => {
    setDeviceListState({ selectedId: device.id });
    onToggleSearchResult();
    setTimeout(() => navigate(`/devices/${device.status}?id=${device.id}`), TIMEOUTS.debounceShort);
  };

  const handlePageChange = page => {
    setSearchState({ page });
  };

  const onSortChange = attribute => {
    let changedSortCol = attribute.name;
    let changedSortDown = sortDown === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    if (changedSortCol !== sortCol) {
      changedSortDown = SORTING_OPTIONS.desc;
    }
    setSearchState({ page: 1, sort: { direction: changedSortDown, key: changedSortCol, scope: attribute.scope } });
  };

  const onClearClick = () => {
    setSearchState({ searchTerm: '' });
    onToggleSearchResult();
  };

  return (
    <Drawer
      anchor="top"
      classes={classes}
      disableEnforceFocus
      open={open}
      ModalProps={{ className: classes.drawerOffset, BackdropProps: { className: classes.drawerOffset } }}
      PaperProps={{ className: `${classes.drawerOffset} ${classes.paper}` }}
      SlideProps={{ direction: 'left' }}
    >
      <div className="flexbox center-aligned margin-bottom-small space-between">
        <ResultTitle onClick={onClearClick} term={searchTerm} total={searchTotal} />
        <IconButton onClick={onToggleSearchResult} aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </div>
      {!!searchTotal && (
        <Devicelist
          className=""
          columnHeaders={columnHeaders}
          customColumnSizes={customColumnSizes}
          deviceListState={{ perPage: 10, sort: {} }}
          devices={devices}
          idAttribute={idAttribute}
          onboardingState={onboardingState}
          onSort={onSortChange}
          PaginationProps={{ rowsPerPageOptions: [10] }}
          pageTotal={searchTotal}
          onPageChange={handlePageChange}
          pageLoading={isSearching}
          onExpandClick={onDeviceSelect}
          setSnackbar={setSnackbar}
        />
      )}
    </Drawer>
  );
};

const actionCreators = { setDeviceListState, setSearchState, setSnackbar };

const mapStateToProps = state => {
  const { columnSelection } = getUserSettings(state);
  return {
    columnSelection,
    customColumnSizes: state.users.customColumns,
    devices: getMappedDevicesList(state, 'search'),
    idAttribute: getIdAttribute(state),
    onboardingState: getOnboardingState(state),
    searchState: state.app.searchState
  };
};

export default connect(mapStateToProps, actionCreators)(SearchResult);
