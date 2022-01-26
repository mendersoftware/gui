import React, { useEffect, useState } from 'react';

import { FirstPage as FirstPageIcon, LastPage as LastPageIcon, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, TablePagination, TextField } from '@mui/material';

import { DEVICE_LIST_DEFAULTS, DEVICE_LIST_MAXIMUM_LENGTH } from '../../constants/deviceConstants';
import { useDebounce } from '../../utils/debouncehook';

const defaultRowsPerPageOptions = [10, 20, DEVICE_LIST_MAXIMUM_LENGTH];
const { perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;
const paginationIndex = 1;

export const TablePaginationActions = ({ count, page = 0, onPageChange, rowsPerPage = defaultPerPage }) => {
  const [pageNo, setPageNo] = useState(page + paginationIndex);

  useEffect(() => {
    setPageNo(page + paginationIndex);
  }, [page, rowsPerPage, count]);

  const debouncedPage = useDebounce(pageNo, 300);

  useEffect(() => {
    const newPage = Math.min(Math.max(paginationIndex, debouncedPage), Math.ceil(count / rowsPerPage));
    if (newPage !== page + paginationIndex) {
      onPageChange(newPage);
    }
  }, [debouncedPage]);

  const onChange = event => {
    const input = event.target.value;
    let value = Number(input);
    if (isNaN(value)) {
      value = pageNo;
    }
    if (value !== pageNo) {
      return setPageNo(value);
    }
  };

  const onKeyPress = event => {
    if (event.key == 'Enter') {
      event.preventDefault();
      const newPage = Math.min(Math.max(paginationIndex, event.target.value), Math.ceil(count / rowsPerPage));
      return setPageNo(newPage);
    }
  };

  const pages = Math.ceil(count / rowsPerPage);
  return (
    <div className="flexbox">
      <IconButton onClick={() => setPageNo(paginationIndex)} disabled={pageNo === paginationIndex} size="large">
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={() => setPageNo(pageNo - 1)} disabled={pageNo === paginationIndex} size="large">
        <KeyboardArrowLeft />
      </IconButton>
      <div className="flexbox" style={{ alignItems: 'baseline' }}>
        <TextField
          value={pageNo}
          onChange={onChange}
          onKeyUp={onKeyPress}
          margin="dense"
          style={{ minWidth: 30, maxWidth: `${`${pageNo}`.length + 2}ch`, marginRight: 10 }}
        />
        {`/ ${pages}`}
      </div>
      <IconButton onClick={() => setPageNo(pageNo + 1)} disabled={pageNo >= Math.ceil(count / rowsPerPage)} size="large">
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={() => setPageNo(Math.max(paginationIndex, Math.ceil(count / rowsPerPage)))}
        disabled={pageNo >= Math.ceil(count / rowsPerPage)}
        size="large"
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

const Pagination = props => {
  const { className, onChangeRowsPerPage, onChangePage, page = 0, ...remainingProps } = props;
  // this is required due to the MUI tablepagination being 0-indexed, whereas we work with 1-indexed apis
  // running it without adjustment will lead to warnings from MUI
  const propsPage = Math.max(page - paginationIndex, 0);
  return (
    <TablePagination
      className={`flexbox margin-top ${className || ''}`}
      classes={{ spacer: 'flexbox no-basis' }}
      component="div"
      labelDisplayedRows={() => ''}
      labelRowsPerPage="Rows"
      rowsPerPageOptions={defaultRowsPerPageOptions}
      onRowsPerPageChange={e => onChangeRowsPerPage(e.target.value)}
      page={propsPage}
      onPageChange={onChangePage}
      ActionsComponent={TablePaginationActions}
      {...remainingProps}
    />
  );
};

export default Pagination;
