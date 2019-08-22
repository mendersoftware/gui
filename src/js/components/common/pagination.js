import React from 'react';

import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { TextField } from '@material-ui/core';

const defaultRowsPerPageOptions = [10, 20, 50];
const paginationIndex = 1;

class TablePaginationActions extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageNo: 1
    };
  }

  componentDidUpdate(prevProps) {
    const currentPage = this.props.page + paginationIndex;
    if (currentPage !== this.state.pageNo && prevProps.rowsPerPage !== this.props.rowsPerPage) {
      this.setState({ pageNo: currentPage });
    }
  }

  onChange = event => {
    const self = this;
    const { pageNo } = self.state;
    const input = event.target.value;
    let value = Number(event.target.value);
    if (input === '') {
      value = input;
    } else if (isNaN(Number(input))) {
      value = pageNo;
    }
    if (value !== pageNo) {
      self.setState({ pageNo: value });
    }
  };

  onKeyPress = event => {
    const self = this;
    const { count, rowsPerPage } = self.props;
    if (event.key == 'Enter') {
      event.preventDefault();
      const newPage = Math.min(Math.max(paginationIndex, event.target.value), Math.ceil(count / rowsPerPage));
      return self.onPaging(newPage);
    }
  };

  onPaging = newPage => {
    this.setState({ pageNo: newPage });
    return this.props.onChangePage(newPage);
  };

  render() {
    const self = this;
    const { count, page, rowsPerPage } = self.props;
    const currentPage = page + paginationIndex;
    const pages = Math.ceil(count / rowsPerPage);

    return (
      <div className="flexbox">
        <IconButton onClick={() => self.onPaging(paginationIndex)} disabled={currentPage === paginationIndex}>
          <FirstPageIcon />
        </IconButton>
        <IconButton onClick={() => self.onPaging(currentPage - 1)} disabled={currentPage === paginationIndex}>
          <KeyboardArrowLeft />
        </IconButton>
        <div className="flexbox" style={{ alignItems: 'baseline' }}>
          <TextField
            value={self.state.pageNo}
            onChange={self.onChange}
            onKeyUp={self.onKeyPress}
            margin="dense"
            style={{ minWidth: '30px', maxWidth: '30px', marginRight: '10px' }}
          />
          {`/ ${pages}`}
        </div>
        <IconButton onClick={() => self.onPaging(currentPage + 1)} disabled={currentPage >= Math.ceil(count / rowsPerPage)}>
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={() => self.onPaging(Math.max(paginationIndex, Math.ceil(count / rowsPerPage)))}
          disabled={currentPage >= Math.ceil(count / rowsPerPage) - paginationIndex}
        >
          <LastPageIcon />
        </IconButton>
      </div>
    );
  }
}

const Pagination = props => {
  const { className, page, onChangeRowsPerPage, onChangePage, ...remainingProps } = props;
  return (
    <TablePagination
      className={`flexbox margin-top ${className}`}
      classes={{ spacer: 'flexbox no-basis' }}
      component="div"
      labelDisplayedRows={() => ''}
      labelRowsPerPage="Rows"
      rowsPerPageOptions={defaultRowsPerPageOptions}
      onChangeRowsPerPage={e => {
        onChangeRowsPerPage(e.target.value);
        return onChangePage(1);
      }}
      page={page - paginationIndex}
      onChangePage={onChangePage}
      ActionsComponent={TablePaginationActions}
      {...remainingProps}
    />
  );
};

export default Pagination;
