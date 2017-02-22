import React from 'react';
import Time from 'react-time';
var ScheduleForm = require('./scheduleform');
var GroupDevices = require('./groupdevices');
var DeploymentStatus = require('./deploymentstatus');

var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var Loader = require('../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';


var Past = React.createClass({
  getInitialState: function() {
    return {
      retry: false,
      pageSize: 5,
      currentPage: 1
    };
  },
  _pastCellClick: function(rowNumber, columnId) {
    // adjust index to allow for client side pagination
    var index = ((this.state.currentPage-1)*this.state.pageSize)+rowNumber;
    var report = this.props.past[index];
    this.props.showReport(report, "past");
  },
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  _handlePageChange: function(pageNo) {
    this.setState({currentPage: pageNo});
  },
  render: function() {
    var pastMap = this.props.past.map(function(deployment, index) {

      if ((index >= (this.state.currentPage-1)*this.state.pageSize) && (index < this.state.currentPage*this.state.pageSize)) {

        var time = "-";
        if (deployment.finished) {
          time = (
            <Time value={this._formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" />
          )
        } 

        //  get statistics
        var status = (
          <DeploymentStatus id={deployment.id} />
        );

        return (
          <TableRow key={index}>
            <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
            <TableRowColumn>{deployment.name}</TableRowColumn>
            <TableRowColumn><Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
            <TableRowColumn>{time}</TableRowColumn>
            <TableRowColumn style={{textAlign:"right", width:"100px"}}><GroupDevices deployment={deployment.id} /></TableRowColumn>
            <TableRowColumn style={{overflow:"visible", width:"350px"}}>{status}</TableRowColumn>
          </TableRow>
        )
      }
    }, this);

    var reportActions = [
      { text: 'Close' }
    ];
    var retryActions = [
      { text: 'Cancel' },
      { text: 'Create deployment', onClick: this._onUploadSubmit, primary: 'true' }
    ];
       
    return (
      <div className="fadeIn">
        <h3>Past deployments</h3>
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          <Table
            onCellClick={this._pastCellClick}
            className={pastMap.length ? null : 'hidden'}
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
                <TableHeaderColumn>Started</TableHeaderColumn>
                <TableHeaderColumn>Finished</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", width:"100px"}}># Devices</TableHeaderColumn>
                <TableHeaderColumn style={{width:"350px"}}>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={true}
              displayRowCheckbox={false}
              style={{cursor:"pointer", overflow:"visible"}}>
              {pastMap}
            </TableBody>
          </Table>

          {
            this.props.past.length ? 
            <Pagination locale={_en_US} simple pageSize={this.state.pageSize} current={this.state.currentPage || 1} total={this.props.past.length} onChange={this._handlePageChange} /> 
            :
            <div className={this.props.loading ? 'hidden' : "dashboard-placeholder"}>
              <p>Completed deployments will appear here.</p>
              <p>You can review logs and reports for each device group you've deployed to</p>
              <img src="assets/img/history.png" alt="Past" />
            </div>
          }

        </div>

      </div>
    );
  }
});

module.exports = Past;