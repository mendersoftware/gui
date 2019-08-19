import React from 'react';
import Time from 'react-time';

// material ui
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import BlockIcon from '@material-ui/icons/Block';

import Pagination from '../common/pagination';
import ConfirmAbort from './confirmabort';
import { formatTime } from '../../helpers';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      abort: null,
      pageSize: 20
    };
  }
  _abortHandler(id) {
    this.props.abort(id);
  }
  _hideConfirm() {
    var self = this;
    setTimeout(() => {
      self.setState({ abort: null });
    }, 150);
  }
  _showConfirm(id) {
    this.setState({ abort: id });
  }
  _handlePageChange(pageNo) {
    this.props.refreshPending(pageNo);
  }
  render() {
    const self = this;
    var pendingMap = this.props.pending.map(function(deployment, index) {
      var abort = (
        <Button
          color="secondary"
          onClick={() => this._showConfirm(deployment.id)}
          icon={<BlockIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
        >
          Abort
        </Button>
      );
      if (this.state.abort === deployment.id) {
        abort = <ConfirmAbort cancel={() => this._hideConfirm(deployment.id)} abort={() => this._abortHandler(deployment.id)} table={true} />;
      }

      //  get statistics
      return (
        <TableRow key={index}>
          <TableCell>{deployment.artifact_name}</TableCell>
          <TableCell>{deployment.name}</TableCell>
          <TableCell>
            <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableCell>
          <TableCell style={{ width: '126px' }}>{deployment.status}</TableCell>
          <TableCell style={{ overflow: 'visible' }}>
            <div className="float-right">{abort}</div>
          </TableCell>
        </TableRow>
      );
    }, this);

    return pendingMap.length ? (
      <div className="deploy-table-contain fadeIn">
        <h3>Pending</h3>
        <Table style={{ overflow: 'visible' }}>
          <TableHead>
            <TableRow style={{ overflow: 'visible' }}>
              <TableCell>Updating to</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Created</TableCell>
              <TableCell style={{ textAlign: 'right', width: '100px' }}># Devices</TableCell>
              <TableCell style={{ width: '126px' }}>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody style={{ overflow: 'visible' }}>{pendingMap}</TableBody>
        </Table>

        {this.props.count > this.props.pending.length ? (
          <Pagination
            count={self.props.count}
            rowsPerPage={self.state.pageSize}
            onChangeRowsPerPage={pageSize => self.setState({ pageSize }, () => self.props.refreshPending(1, pageSize))}
            page={self.props.page}
            onChangePage={page => self.props.refreshPending(page, self.state.pageSize)}
          />
        ) : null}
      </div>
    ) : null;
  }
}
