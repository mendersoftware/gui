import React from 'react';
import Time from 'react-time';
var GroupDevices = require('./groupdevices');
import BlockIcon from 'react-material-icons/icons/content/block';
var ConfirmAbort = require('./confirmabort');

var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';

var Pending = React.createClass({
  getInitialState: function() {
    return {
      abort: null,
      pageSize: 20
    };
  },
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  _abortHandler: function(id) {
    this.props.abort(id);
  },
  _hideConfirm: function() {
    var self = this;
    setTimeout(function() {
      self.setState({abort:null});
    }, 150);
  },
  _showConfirm: function(id) {
    this.setState({abort:id});
  },
  _handlePageChange: function(pageNo) {
    this.props.refreshPending(pageNo);
    this.setState({currentPage: pageNo});
  },
  render: function() {
    var pendingMap = this.props.pending.map(function(deployment, index) {
      var abort = (
        <FlatButton label="Abort" secondary={true} onClick={this._showConfirm.bind(null, deployment.id)} icon={<BlockIcon style={{height:"18px", width:"18px", verticalAlign:"middle"}}/>}/>
      );
      if (this.state.abort === deployment.id) {
        abort = (
          <ConfirmAbort cancel={this._hideConfirm.bind(null, deployment.id)} abort={this._abortHandler.bind(null, deployment.id)} table={true}/>
        );
      }

      //  get statistics
      return (
        <TableRow key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right", width:"100px"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
          <TableRowColumn style={{width:"126px"}}>{deployment.status}</TableRowColumn>
          <TableRowColumn style={{overflow:"visible"}}>
            <div className="float-right">{abort}</div>
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    return (
      <div className={pendingMap.length ? "fadeIn" : "hidden" }>
        <h3>Pending</h3>
        <div className="deploy-table-contain">
          <Table
            selectable={false}
            style={{overflow:"visible"}}
            wrapperStyle={{overflow:"visible"}}
            bodyStyle={{overflow:"visible"}}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow
              style={{overflow:"visible"}}>
                <TableHeaderColumn>Updating to</TableHeaderColumn>
                <TableHeaderColumn>Group</TableHeaderColumn>
                <TableHeaderColumn>Created</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", width:"100px"}}># Devices</TableHeaderColumn>
                <TableHeaderColumn style={{width:"126px"}}>Status</TableHeaderColumn>
                <TableHeaderColumn></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
            >
              {pendingMap}
            </TableBody>
          </Table>
       
          {
            this.props.count>this.props.pending.length ? 
            <Pagination locale={_en_US} simple pageSize={this.state.pageSize} current={this.state.currentPage || 1} total={this.props.count} onChange={this._handlePageChange} /> 
            :
            null
          }
        </div>
      </div>
    );
  }
});

module.exports = Pending;