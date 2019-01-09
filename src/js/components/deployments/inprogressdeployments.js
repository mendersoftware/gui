import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';
import { CreateDeployment, ProgressDeployment } from '../helptips/helptooltips';
var createReactClass = require('create-react-class');
var DeploymentStatus = require('./deploymentstatus');

var Pagination = require('rc-pagination');
var _en_US = require('rc-pagination/lib/locale/en_US');
var Loader = require('../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';

var Progress = createReactClass({
  getInitialState: function() {
    return {
      retry: false,
      pageSize: 20
    };
  },
  _progressCellClick: function(rowNumber) {
    this.props.openReport(rowNumber, 'progress');
  },
  _formatTime: function(date) {
    if (date) {
      return date
        .replace(' ', 'T')
        .replace(/ /g, '')
        .replace('UTC', '');
    }
    return;
  },
  _handlePageChange: function(pageNo) {
    this.props.refreshProgress(pageNo);
  },
  render: function() {
    // get statistics for each in progress
    var progressMap = this.props.progress.map(function(deployment, index) {
      var status = <DeploymentStatus isActiveTab={this.props.isActiveTab} refresh={true} id={deployment.id} />;
      return (
        <TableRow style={{ height: '52px' }} key={index}>
          <TableRowColumn>{deployment.artifact_name}</TableRowColumn>
          <TableRowColumn>{deployment.name}</TableRowColumn>
          <TableRowColumn>
            <Time value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn style={{ textAlign: 'right', width: '100px' }}>{deployment.device_count}</TableRowColumn>
          <TableRowColumn style={{ overflow: 'visible', width: '350px' }}>{status}</TableRowColumn>
        </TableRow>
      );
    }, this);

    return (
      <div className="fadeIn">
        <div className="deploy-table-contain">
          <Loader show={this.props.loading} />
          {progressMap.length ? (
            <div>
              <h3>In progress</h3>
              <Table
                onCellClick={this._progressCellClick}
                className={progressMap.length ? null : 'hidden'}
                selectable={false}
                style={{ overflow: 'visible' }}
                wrapperStyle={{ overflow: 'visible' }}
                bodyStyle={{ overflow: 'visible' }}
              >
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow style={{ overflow: 'visible' }}>
                    <TableHeaderColumn>Updating to</TableHeaderColumn>
                    <TableHeaderColumn>Group</TableHeaderColumn>
                    <TableHeaderColumn>Started</TableHeaderColumn>
                    <TableHeaderColumn style={{ textAlign: 'right', width: '100px' }}># Devices</TableHeaderColumn>
                    <TableHeaderColumn style={{ width: '350px' }}>Status</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody showRowHover={true} displayRowCheckbox={false} className="clickable">
                  {progressMap}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {this.props.count > this.props.progress.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.state.pageSize}
              current={this.props.page || 1}
              total={this.props.count}
              onChange={this._handlePageChange}
            />
          ) : null}

          {this.props.count || this.props.pendingCount ? null : (
            <div className={progressMap.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
              <p>Pending and ongoing deployments will appear here. </p>
              <p>
                <a onClick={this.props.createClick}>Create a deployment</a> to get started
              </p>
              <img src="assets/img/deployments.png" alt="In progress" />
            </div>
          )}

          {!this.props.loading && this.props.showHelptips && (!this.props.hasDeployments || this.props.progress.length) ? (
            // if first deployment not created, or if there is one in progress, show tip
            <div>
              <div
                id="onboard-12"
                className={this.props.hasDeployments ? 'tooltip help' : 'tooltip help highlight'}
                data-tip
                data-for="create-deployment-tip"
                data-event="click focus"
              >
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip id="create-deployment-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                {!this.props.hasDeployments ? (
                  <CreateDeployment devices={this.props.devices.length} artifacts={this.props.hasArtifacts} />
                ) : (
                  <ProgressDeployment />
                )}
              </ReactTooltip>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
});

module.exports = Progress;
