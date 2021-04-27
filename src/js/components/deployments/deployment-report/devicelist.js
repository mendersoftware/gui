import React, { useEffect, useState } from 'react';
import differenceWith from 'lodash.differencewith';
import isEqual from 'lodash.isequal';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import Pagination from '../../common/pagination';
import DeploymentDeviceListItem from './deploymentdevicelistitem';

const headerStyle = { position: 'sticky', top: 0, background: 'white', zIndex: 1 };

export const DeploymentDeviceList = ({ allDevices, created, deployment, devicesById, getDeviceAuth, getDeviceById, idAttribute, viewLog }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const totalDeviceCount = allDevices.length ?? deployment.device_count ?? 0;
  const end = Math.min(allDevices.length, perPage);
  const [pagedDevices, setPagedDevices] = useState(allDevices.slice(0, end));
  const { retries } = deployment;

  useEffect(() => {
    handlePageChange(currentPage);
  }, []);

  useEffect(() => {
    handlePageChange(1);
  }, [perPage]);

  const getDeviceDetails = devices => {
    // get device artifact, inventory and identity details not listed in schedule data
    devices.map(device => Promise.all([getDeviceById(device.id), getDeviceAuth(device.id)]));
  };

  const handlePageChange = pageNo => {
    const start = pageNo * perPage - perPage;
    const end = Math.min(allDevices.length, pageNo * perPage);
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

  return totalDeviceCount || !!pagedDevices.length ? (
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
          {pagedDevices.map(device => (
            <DeploymentDeviceListItem key={device.id} created={created} device={device} idAttribute={idAttribute} viewLog={viewLog} retries={retries} />
          ))}
        </TableBody>
      </Table>
      <Pagination count={totalDeviceCount} rowsPerPage={perPage} onChangePage={handlePageChange} onChangeRowsPerPage={setPerPage} page={currentPage} />
    </div>
  ) : (
    <div />
  );
};

export default DeploymentDeviceList;
