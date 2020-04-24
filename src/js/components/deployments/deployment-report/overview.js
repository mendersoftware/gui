import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';
import differenceWith from 'lodash.differencewith';
import isEqual from 'lodash.isequal';

import { Button, Tooltip } from '@material-ui/core';
import { Block as BlockIcon, Timelapse as TimelapseIcon, Refresh as RefreshIcon } from '@material-ui/icons';

import { formatTime } from '../../../helpers';
import ExpandableAttribute from '../../common/expandable-attribute';
import Pagination from '../../common/pagination';

import DeviceList from './devicelist';
import DeploymentStatus from './../deploymentstatus';
import Confirm from './../confirm';

export default class DeploymentOverview extends React.Component {
  constructor(props, state) {
    super(props, state);
    const perPage = 20;
    const end = Math.min(props.deviceCount, perPage);
    this.state = {
      aborting: false,
      currentPage: 1,
      pagedDevices: props.allDevices.slice(0, end),
      perPage
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.deployment.stats !== this.props.deployment.stats || prevProps.allDevices !== this.props.allDevices) {
      this.handlePageChange(this.state.currentPage);
    }
  }

  getDeviceDetails(devices) {
    // get device artifact, inventory and identity details not listed in schedule data
    devices.map(device => Promise.all([this.props.getDeviceById(device.id), this.props.getDeviceAuth(device.id)]));
  }

  handlePageChange(pageNo) {
    const self = this;
    const start = pageNo * self.state.perPage - self.state.perPage;
    const end = Math.min(self.props.deviceCount, pageNo * self.state.perPage);
    // cut slice from full list of devices
    const devices = self.props.allDevices;
    const slice = devices.slice(start, end);
    const lackingData = self.state.pagedDevices.reduce((accu, device) => {
      if (
        !self.props.devicesById[device.id] ||
        !self.props.devicesById[device.id].identity_data ||
        !self.props.devicesById[device.id].attributes ||
        Object.keys(self.props.devicesById[device.id].attributes).length === 0
      ) {
        accu.push(device);
      }
      return accu;
    }, []);
    if (!isEqual(slice, self.state.pagedDevices) || lackingData.length) {
      var diff = differenceWith(slice, self.state.pagedDevices, isEqual);
      // only update those that have changed
      self.getDeviceDetails(diff.concat(lackingData));
    }
    self.setState({ currentPage: pageNo, end: end, pagedDevices: slice });
  }

  render() {
    const self = this;
    const { deployment, deviceCount, duration, onAbortClick, onRetryClick, viewLog } = self.props;
    const { aborting, currentPage, pagedDevices, perPage } = self.state;
    const finished = deployment.finished || deployment.status === 'finished';
    const created = deployment.created || new Date();

    const statusDescription = finished ? (
      <div>Finished {!!deployment.stats.failure && <span className="failures">with failures</span>}</div>
    ) : (
      <div className="capitalized-start">
        {deployment.status}
        {deployment.status === 'pending' ? ' (awaiting devices)' : ''}
      </div>
    );
    return (
      <div>
        <div className="report-container">
          <div className="deploymentInfo two-columns">
            <div>
              <ExpandableAttribute
                primary="Release:"
                secondary={
                  <Link style={{ fontWeight: '500' }} to={`/releases/${encodeURIComponent(deployment.artifact_name)}`}>
                    {deployment.artifact_name}
                  </Link>
                }
                dividerDisabled={true}
                style={{ marginBottom: -15 }}
              />
              <ExpandableAttribute primary="Device group:" secondary={deployment.name} dividerDisabled={true} style={{ marginBottom: -15 }} />
            </div>
            <ExpandableAttribute primary="Status:" secondary={statusDescription} dividerDisabled={true} style={{ marginBottom: -15 }} />
          </div>
          {finished ? (
            !!(deployment.stats.failure || deployment.stats.aborted || deployment.stats.success) && (
              <div className="statusLarge margin-top-large flexbox centered" style={{ alignItems: 'flex-start' }}>
                <img src={deployment.stats.success ? 'assets/img/largeSuccess.png' : 'assets/img/largeFail.png'} />
                <div className="statusWrapper">
                  {!!deployment.stats.success && (
                    <>
                      <b className="green">
                        {deployment.stats.success === pagedDevices.length && <span>All </span>}
                        {deployment.stats.success}
                      </b>{' '}
                      {pluralize('devices', deployment.stats.success)} updated successfully
                    </>
                  )}
                  {!!(deployment.stats.failure || deployment.stats.aborted) && (
                    <>
                      <b className="red">{deployment.stats.failure || deployment.stats.aborted}</b> {pluralize('devices', deployment.stats.failure)} failed to
                      update
                    </>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="progressStatus flexbox centered space-between">
              <div id="progressStatus">
                <h3 style={{ marginTop: 0 }}>In progress</h3>
                <h2>
                  <TimelapseIcon style={{ margin: '0 10px 0 -10px', color: '#ACD4D0', verticalAlign: 'text-top' }} />
                  <span>{`${duration.format('d [d] *hh [h] mm [m] ss [s]')}`}</span>
                </h2>
                <div>
                  <div>Started: </div>
                  <Time value={formatTime(created)} format="YYYY-MM-DD HH:mm" />
                </div>
              </div>
              <DeploymentStatus vertical={true} stats={deployment.stats} />
            </div>
          )}
          {!finished ? (
            <>
              {aborting ? (
                <Confirm cancel={() => self.setState({ aborting: !aborting })} action={onAbortClick} type="abort" classes="margin-top" />
              ) : (
                <Tooltip
                  title="Devices that have not yet started the deployment will not start the deployment.&#10;Devices that have already completed the deployment are not affected by the abort.&#10;Devices that are in the middle of the deployment at the time of abort will finish deployment normally, but will perform a rollback."
                  placement="bottom"
                >
                  <Button
                    color="secondary"
                    onClick={() => self.setState({ aborting: !aborting })}
                    startIcon={<BlockIcon fontSize="small" />}
                    style={{ alignSelf: 'baseline', marginTop: 45 }}
                  >
                    {deployment.filters?.length ? 'Stop' : 'Abort'} deployment
                  </Button>
                </Tooltip>
              )}
            </>
          ) : (
            !!(deployment.stats.failure || deployment.stats.aborted) && (
              <Tooltip
                title="This will create a new deployment with the same device group and Release.&#10;Devices with this Release already installed will be skipped, all others will be updated."
                placement="bottom"
              >
                <Button color="secondary" startIcon={<RefreshIcon fontSize="small" />} onClick={onRetryClick} style={{ alignSelf: 'baseline', marginTop: 45 }}>
                  Retry deployment?
                </Button>
              </Tooltip>
            )
          )}
        </div>
        {(deviceCount || deployment.deviceCount || !!pagedDevices.length) && (
          <div style={{ minHeight: '20vh' }}>
            <DeviceList created={created} status={deployment.status} devices={pagedDevices} viewLog={viewLog} past={finished} />
            <Pagination
              count={deviceCount || deployment.device_count}
              rowsPerPage={perPage}
              onChangePage={page => self.handlePageChange(page)}
              onChangeRowsPerPage={perPage => self.setState({ perPage }, () => self.handlePageChange(1))}
              page={currentPage}
            />
          </div>
        )}
      </div>
    );
  }
}
