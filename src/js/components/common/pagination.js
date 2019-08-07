import React from 'react';

import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { TextField } from '@material-ui/core';

const defaultRowsPerPageOptions = [10, 20, 50];

const TablePaginationActions = props => {
  const { count, page, rowsPerPage, onChangePage } = props;
  const currentPage = page + 1;

  function handleFirstPageButtonClick(event) {
    onChangePage(event, 0);
  }

  function handleBackButtonClick(event) {
    onChangePage(event, currentPage - 1);
  }

  function handleNextButtonClick(event) {
    onChangePage(event, currentPage + 1);
  }

  function handleLastPageButtonClick(event) {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  }

  const pages = Math.ceil(count / rowsPerPage);
  return (
    <div className="flexbox">
      <IconButton onClick={handleFirstPageButtonClick} disabled={currentPage === 0}>
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={currentPage === 0}>
        <KeyboardArrowLeft />
      </IconButton>
      <div className="flexbox" style={{ alignItems: 'baseline' }}>
        <TextField
          value={currentPage}
          onChange={e => onChangePage(e, e.target.value)}
          margin="dense"
          style={{ minWidth: '40px', maxWidth: '40px', marginRight: '10px' }}
        />{' '}
        / {pages}
      </div>
      <IconButton onClick={handleNextButtonClick} disabled={currentPage >= Math.ceil(count / rowsPerPage) - 1}>
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={currentPage >= Math.ceil(count / rowsPerPage) - 1}>
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

export default class Pagination extends React.PureComponent {
  render() {
    const { className, rowsPerPage, page, count, onChangeRowsPerPage, onPageChange } = this.props;
    return (
      <TablePagination
        className={`flexbox margin-top ${className}`}
        classes={{ spacer: 'flexbox no-basis' }}
        component="div"
        count={count}
        labelDisplayedRows={() => ''}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={defaultRowsPerPageOptions}
        onChangeRowsPerPage={e => onChangeRowsPerPage(e.target.value)}
        page={page - 1}
        onChangePage={(_, page) => onPageChange(page + 1)}
        ActionsComponent={TablePaginationActions}
      />
    );
  }
}
