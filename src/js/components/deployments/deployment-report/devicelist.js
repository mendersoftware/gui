import React, { useEffect, useState } from 'react';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import Pagination from '../../common/pagination';
import DeploymentDeviceListItem from './deploymentdevicelistitem';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';

const headerStyle = { position: 'sticky', top: 0, background: 'white', zIndex: 1 };
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

export const DeploymentDeviceList = ({
  deployment,
  getDeploymentDevices,
  getDeviceAuth,
  getDeviceById,
  idAttribute,
  refreshTrigger,
  selectedDevices,
  viewLog
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const { created = new Date().toISOString(), device_count = 0, retries, totalDeviceCount: totalDevices } = deployment;
  const totalDeviceCount = totalDevices ?? device_count;

  useEffect(() => {
    setCurrentPage(1);
  }, [perPage]);

  useEffect(() => {
    // only update those that have changed & lack data
    const lackingData = selectedDevices.reduce((accu, device) => {
      if (!device.identity_data || !device.attributes || Object.keys(device.attributes).length === 0) {
        accu.push(device.id);
      }
      return accu;
    }, []);
    // get device artifact, inventory and identity details not listed in schedule data
    lackingData.map(deviceId => Promise.all([getDeviceById(deviceId), getDeviceAuth(deviceId)]));
  }, [selectedDevices]);

  useEffect(() => {
    if (deployment.id) {
      getDeploymentDevices(deployment.id, { page: currentPage, perPage });
    }
  }, [currentPage, deployment.status, deployment.stats, refreshTrigger]);

  return (
    !!totalDeviceCount && (
      <div>
        <Table style={{ minHeight: '10vh', maxHeight: '40vh', overflowX: 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell style={headerStyle} tooltip={idAttribute}>
                {idAttribute}
              </TableCell>
              {['Device type', 'Current software', 'Started', 'Finished', 'Attempts', 'Deployment status', ''].map((content, index) =>
                content != 'Attempts' || retries ? (
                  <TableCell key={`device-list-header-${index + 1}`} style={headerStyle} tooltip={content}>
                    {content}
                  </TableCell>
                ) : null
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedDevices.map(device => (
              <DeploymentDeviceListItem key={device.id} created={created} device={device} idAttribute={idAttribute} viewLog={viewLog} retries={retries} />
            ))}
          </TableBody>
        </Table>
        <Pagination count={totalDeviceCount} rowsPerPage={perPage} onChangePage={setCurrentPage} onChangeRowsPerPage={setPerPage} page={currentPage} />
      </div>
    )
  );
};

export default DeploymentDeviceList;
