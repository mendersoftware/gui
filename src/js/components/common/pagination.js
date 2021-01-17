import React, { useEffect, useState } from 'react';

import { FirstPage as FirstPageIcon, LastPage as LastPageIcon, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { IconButton, TablePagination, TextField } from '@material-ui/core';

import { DEVICE_LIST_MAXIMUM_LENGTH } from '../../constants/deviceConstants';

const defaultRowsPerPageOptions = [10, 20, DEVICE_LIST_MAXIMUM_LENGTH];
const paginationIndex = 1;

export const TablePaginationActions = ({ count, page, onChangePage, rowsPerPage = 20 }) => {
  const [pageNo, setPageNo] = useState(paginationIndex);

  useEffect(() => {
    setPageNo(page + paginationIndex);
  }, [page]);

  useEffect(() => {
    const newPage = Math.min(Math.max(paginationIndex, pageNo), Math.ceil(count / rowsPerPage));
    if (newPage !== page + paginationIndex) {
      onChangePage(newPage);
    }
  }, [pageNo]);

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

  const currentPage = page + paginationIndex;
  const pages = Math.ceil(count / rowsPerPage);
  return (
    <div className="flexbox">
      <IconButton onClick={() => setPageNo(paginationIndex)} disabled={currentPage === paginationIndex}>
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={() => setPageNo(currentPage - 1)} disabled={currentPage === paginationIndex}>
        <KeyboardArrowLeft />
      </IconButton>
      <div className="flexbox" style={{ alignItems: 'baseline' }}>
        <TextField value={pageNo} onChange={onChange} onKeyUp={onKeyPress} margin="dense" style={{ minWidth: 30, maxWidth: 30, marginRight: 10 }} />
        {`/ ${pages}`}
      </div>
      <IconButton onClick={() => setPageNo(currentPage + 1)} disabled={currentPage >= Math.ceil(count / rowsPerPage)}>
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={() => setPageNo(Math.max(paginationIndex, Math.ceil(count / rowsPerPage)))} disabled={currentPage >= Math.ceil(count / rowsPerPage)}>
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

const Pagination = props => {
  const { className, page, onChangeRowsPerPage, onChangePage, ...remainingProps } = props;
  return (
    <TablePagination
      className={`flexbox margin-top ${className || ''}`}
      classes={{ spacer: 'flexbox no-basis' }}
      component="div"
      labelDisplayedRows={() => ''}
      labelRowsPerPage="Rows"
      rowsPerPageOptions={defaultRowsPerPageOptions}
      onChangeRowsPerPage={e => onChangeRowsPerPage(e.target.value)}
      page={page - paginationIndex}
      onChangePage={onChangePage}
      ActionsComponent={TablePaginationActions}
      {...remainingProps}
    />
  );
};

export default Pagination;
