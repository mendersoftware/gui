import React, { useEffect, useRef, useState } from 'react';

import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, TablePagination } from '@mui/material';

import { DEVICE_LIST_DEFAULTS, DEVICE_LIST_MAXIMUM_LENGTH } from '../../constants/deviceConstants';
import MenderTooltip from '../common/mendertooltip';
import { useDebounce } from '../../utils/debouncehook';

const defaultRowsPerPageOptions = [10, 20, DEVICE_LIST_MAXIMUM_LENGTH];
const { perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;
const paginationIndex = 1;
const paginationLimit = 10000;

const MaybeWrapper = ({ children, disabled }) =>
  disabled ? (
    <MenderTooltip arrow placement="top" title="Please refine your filter criteria first in order to proceed.">
      <div>{children}</div>
    </MenderTooltip>
  ) : (
    <div>{children}</div>
  );

export const TablePaginationActions = ({ count, page = 0, onPageChange, rowsPerPage = defaultPerPage }) => {
  const [pageNo, setPageNo] = useState(page + paginationIndex);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

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

  const pages = Math.ceil(count / rowsPerPage);

  const isAtPaginationLimit = pageNo >= paginationLimit / rowsPerPage;
  return (
    <div className="flexbox center-aligned">
      <div>{`${(pageNo - paginationIndex) * rowsPerPage + 1}-${Math.min(pageNo * rowsPerPage, count)} of ${count}`}</div>
      <IconButton onClick={() => setPageNo(pageNo - 1)} disabled={pageNo === paginationIndex} size="large">
        <KeyboardArrowLeft />
      </IconButton>
      <MaybeWrapper disabled={isAtPaginationLimit}>
        <IconButton onClick={() => setPageNo(pageNo + 1)} disabled={pageNo >= pages || isAtPaginationLimit} size="large">
          <KeyboardArrowRight />
        </IconButton>
      </MaybeWrapper>
    </div>
  );
};

const Pagination = props => {
  const { className, onChangeRowsPerPage, onChangePage, page = 0, rowsPerPageOptions = defaultRowsPerPageOptions, ...remainingProps } = props;
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
      rowsPerPageOptions={rowsPerPageOptions}
      onRowsPerPageChange={e => onChangeRowsPerPage(e.target.value)}
      page={propsPage}
      onPageChange={onChangePage}
      ActionsComponent={TablePaginationActions}
      {...remainingProps}
    />
  );
};

export default Pagination;
