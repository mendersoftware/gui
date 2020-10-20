import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';
import differenceWith from 'lodash.differencewith';
import isEqual from 'lodash.isequal';

import { Button, Tooltip } from '@material-ui/core';
import { Block as BlockIcon, Timelapse as TimelapseIcon, Refresh as RefreshIcon } from '@material-ui/icons';

import { formatTime } from '../../../helpers';
import Confirm from '../../common/confirm';
import ExpandableAttribute from '../../common/expandable-attribute';
import Pagination from '../../common/pagination';

import DeviceList from './devicelist';
import DeploymentStatus from './../deploymentstatus';

export const DeploymentOverview = ({
  allDevices,
  deployment,
  deviceCount,
  devicesById,
  duration,
  getDeviceAuth,
  getDeviceById,
  onAbortClick,
  onRetryClick,
  viewLog
}) => {
  const [perPage, setPerPage] = useState(20);
  const end = Math.min(deviceCount, perPage);
  const [aborting, setAborting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedDevices, setPagedDevices] = useState(allDevices.slice(0, end));

  useEffect(() => {
    handlePageChange(currentPage);
  }, [deployment.stats, allDevices]);
  useEffect(() => {
    handlePageChange(1);
  }, [perPage]);

  const getDeviceDetails = devices => {
    // get device artifact, inventory and identity details not listed in schedule data
    devices.map(device => Promise.all([getDeviceById(device.id), getDeviceAuth(device.id)]));
  };

  const handlePageChange = pageNo => {
    const start = pageNo * perPage - perPage;
    const end = Math.min(deviceCount, pageNo * perPage);
    // cut slice from full list of devices
    const devices = allDevices;
    const slice = devices.slice(start, end);
    const lackingData = pagedDevices.reduce((accu, device) => {
      if (
        !devicesById[device.id] ||
        !devicesById[device.id].identity_data ||
        !devicesById[device.id].attributes ||
        Object.keys(devicesById[device.id].attributes).length === 0
      ) {
        accu.push(device);
      }
      return accu;
    }, []);
    if (!isEqual(slice, pagedDevices) || lackingData.length) {
      var diff = differenceWith(slice, pagedDevices, isEqual);
      // only update those that have changed
      getDeviceDetails(diff.concat(lackingData));
    }
    setCurrentPage(pageNo);
    setPagedDevices(slice);
  };

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
          !!(
            deployment.stats.failure ||
            deployment.stats.aborted ||
            deployment.stats.success ||
            (deployment.stats.failure == 0 && deployment.stats.aborted == 0)
          ) && (
            <div className="statusLarge margin-top-large flexbox centered" style={{ alignItems: 'flex-start' }}>
              <img src={deployment.stats.success ? 'assets/img/largeSuccess.png' : 'assets/img/largeFail.png'} />
              <div className="statusWrapper">
                <div className="statusWrapperMessage">
                  {!!deployment.stats.success && (
                    <div>
                      <b className="green">
                        {deployment.stats.success === pagedDevices.length && <span>All </span>}
                        {deployment.stats.success}
                      </b>{' '}
                      {pluralize('devices', deployment.stats.success)} updated successfully
                    </div>
                  )}
                  {deployment.stats.success == 0 && deployment.stats.failure == 0 && deployment.stats.aborted == 0 && (
                    <div>
                      <b className="red">0</b> devices updated successfully
                    </div>
                  )}
                  {!!(deployment.stats.failure || deployment.stats.aborted) && (
                    <div>
                      <b className="red">{deployment.stats.failure || deployment.stats.aborted}</b> {pluralize('devices', deployment.stats.failure)} failed to
                      update
                    </div>
                  )}
                </div>
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
            <DeploymentStatus vertical={true} deployment={deployment} />
          </div>
        )}
        {!finished ? (
          <>
            {aborting ? (
              <Confirm cancel={() => setAborting(!aborting)} action={onAbortClick} type="abort" classes="margin-top" />
            ) : (
              <Tooltip
                title="Devices that have not yet started the deployment will not start the deployment.&#10;Devices that have already completed the deployment are not affected by the abort.&#10;Devices that are in the middle of the deployment at the time of abort will finish deployment normally, but will perform a rollback."
                placement="bottom"
              >
                <Button
                  color="secondary"
                  onClick={() => setAborting(!aborting)}
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
          <DeviceList created={created} status={deployment.status} devices={pagedDevices} viewLog={viewLog} past={finished} retries={deployment.retries} />
          <Pagination
            count={deviceCount || deployment.device_count}
            rowsPerPage={perPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={setPerPage}
            page={currentPage}
          />
        </div>
      )}
    </div>
  );
};

export default DeploymentOverview;
