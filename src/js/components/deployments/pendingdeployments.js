import React from 'react';
import Time from 'react-time';

import ConfirmAbort from './confirmabort';

import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import BlockIcon from 'react-material-icons/icons/content/block';

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      abort: null,
      pageSize: 20
    };
  }
  _formatTime(date) {
    if (date) {
      return date
        .replace(' ', 'T')
        .replace(/ /g, '')
        .replace('UTC', '');
    }
    return;
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
    var pendingMap = this.props.pending.map(function(deployment, index) {
      var abort = (
        <FlatButton
          label="Abort"
          secondary={true}
          onClick={() => this._showConfirm(deployment.id)}
          icon={<BlockIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
        />
      );
      if (this.state.abort === deployment.id) {
        abort = <ConfirmAbort cancel={() => this._hideConfirm(deployment.id)} abort={() => this._abortHandler(deployment.id)} table={true} />;
      }

      //  get statistics
      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn>
            <Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableRowColumn>
          <TableRowColumn style={{ width: '126px' }}>{deployment.status}</TableRowColumn>
          <TableRowColumn style={{ overflow: 'visible' }}>
            <div className="float-right">{abort}</div>
          </TableRowColumn>
        </TableRow>
      );
    }, this);

    return (
      <div className={pendingMap.length ? 'fadeIn' : 'hidden'}>
        <div className="deploy-table-contain">
          <h3>Pending</h3>
          <Table selectable={false} style={{ overflow: 'visible' }} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow style={{ overflow: 'visible' }}>
                <TableHeaderColumn>Updating to</TableHeaderColumn>
                <TableHeaderColumn>Group</TableHeaderColumn>
                <TableHeaderColumn>Created</TableHeaderColumn>
                <TableHeaderColumn style={{ textAlign: 'right', width: '100px' }}># Devices</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '126px' }}>Status</TableHeaderColumn>
                <TableHeaderColumn />
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>{pendingMap}</TableBody>
          </Table>

          {this.props.count > this.props.pending.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.state.pageSize}
              current={this.props.page || 1}
              total={this.props.count}
              onChange={page => this._handlePageChange(page)}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
