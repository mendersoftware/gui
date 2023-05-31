// Copyright 2022 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { setSnackbar } from '../../../actions/appActions';
import { getSystemDevices } from '../../../actions/deviceActions';
import { SORTING_OPTIONS } from '../../../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import { getDemoDeviceAddress, toggle, versionCompare } from '../../../helpers';
import { getDocsVersion, getIdAttribute, getTenantCapabilities } from '../../../selectors';
import { TwoColumnData } from '../../common/configurationobject';
import EnterpriseNotification from '../../common/enterpriseNotification';
import { getHeaders } from '../authorized-devices';
import { routes } from '../base-devices';
import Devicelist from '../devicelist';
import ConnectToGatewayDialog from '../dialogs/connecttogatewaydialog';
import DeviceDataCollapse from './devicedatacollapse';

const useStyles = makeStyles()(theme => ({ container: { maxWidth: 600, marginTop: theme.spacing(), marginBottom: theme.spacing() } }));

export const DeviceSystem = ({
  columnSelection,
  device,
  devicesById,
  docsVersion,
  getSystemDevices,
  hasFullFiltering,
  idAttribute,
  onConnectToGatewayClick,
  openSettingsDialog,
  setSnackbar
}) => {
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [headerKeys, setHeaderKeys] = useState([]);
  const [page, setPage] = useState(DEVICE_LIST_DEFAULTS.page);
  const [perPage, setPerPage] = useState(DEVICE_LIST_DEFAULTS.perPage);
  const { classes } = useStyles();
  const navigate = useNavigate();

  const { systemDeviceIds = [], systemDeviceTotal = 0 } = device;
  const deviceIp = getDemoDeviceAddress([device]);

  const [sortOptions, setSortOptions] = useState([]);

  const onSortChange = attribute => {
    let changedOrder = SORTING_OPTIONS.asc;
    if (sortOptions.length && sortOptions[0].attribute == attribute.name) {
      changedOrder = sortOptions[0].order === SORTING_OPTIONS.desc ? SORTING_OPTIONS.asc : SORTING_OPTIONS.desc;
    }
    setSortOptions([{ attribute: attribute.name, scope: attribute.scope, order: changedOrder }]);
  };

  useEffect(() => {
    const columnHeaders = getHeaders(columnSelection, routes.allDevices.defaultHeaders, idAttribute, openSettingsDialog);
    setColumnHeaders(columnHeaders);
    setHeaderKeys(columnHeaders.map(({ attribute: { name, scope } }) => `${name}-${scope}`).join('-'));
  }, [columnSelection, idAttribute.attribute]);

  useEffect(() => {
    if (device.attributes) {
      getSystemDevices(device.id, { page, perPage, sortOptions });
    }
  }, [device.id, device.attributes?.mender_is_gateway, page, perPage, sortOptions]);

  const onDeviceClick = (device = {}) => navigate(`/devices/${device.status}?id=${device.id}&open=true&tab=identity`);

  return (
    <>
      <DeviceDataCollapse title="Mender Gateway">
        <TwoColumnData config={{ 'Server IP': deviceIp }} compact setSnackbar={setSnackbar} />
      </DeviceDataCollapse>
      <DeviceDataCollapse className={classes.container} title="System for this gateway">
        <EnterpriseNotification isEnterprise={hasFullFiltering} benefit="see devices connected to your gateway device for easy access" />
        {systemDeviceTotal ? (
          <Devicelist
            customColumnSizes={[]}
            columnHeaders={columnHeaders}
            devices={systemDeviceIds.map(id => devicesById[id])}
            deviceListState={{ page, perPage }}
            headerKeys={headerKeys}
            idAttribute={idAttribute}
            onChangeRowsPerPage={setPerPage}
            onExpandClick={onDeviceClick}
            onResizeColumns={false}
            onPageChange={setPage}
            onSelect={false}
            onSort={onSortChange}
            pageLoading={false}
            pageTotal={systemDeviceTotal}
          />
        ) : (
          <div className="dashboard-placeholder">
            <p>No devices have been connected to this gateway device yet.</p>
            <div>
              Visit the{' '}
              <a href={`https://docs.mender.io/${docsVersion}get-started/mender-gateway`} target="_blank" rel="noopener noreferrer">
                full Mender Gateway documentation
              </a>{' '}
              to learn how to make the most of the gateway functionality.
            </div>
          </div>
        )}
      </DeviceDataCollapse>
      <div className="flexbox">
        <Button color="secondary" component={Link} to={`/deployments?deviceId=${device.id}&open=true`}>
          Create deployment for this system
        </Button>
        <Button onClick={onConnectToGatewayClick}>Connect devices</Button>
      </div>
    </>
  );
};

const DeviceSystemTab = ({ docsVersion, device, isPreRelease, tenantToken, ...remainder }) => {
  const [open, setOpen] = useState(false);
  const gatewayIp = getDemoDeviceAddress([device]);
  const toggleDialog = () => setOpen(toggle);
  return (
    <>
      <DeviceSystem device={device} docsVersion={docsVersion} onConnectToGatewayClick={toggleDialog} {...remainder} />
      {open && (
        <ConnectToGatewayDialog docsVersion={docsVersion} gatewayIp={gatewayIp} isPreRelease={isPreRelease} onCancel={toggleDialog} tenantToken={tenantToken} />
      )}
    </>
  );
};

const actionCreators = { getSystemDevices, setSnackbar };

const mapStateToProps = state => {
  return {
    devicesById: state.devices.byId,
    docsVersion: getDocsVersion(state),
    hasFullFiltering: getTenantCapabilities(state),
    idAttribute: getIdAttribute(state),
    isPreRelease: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    tenantToken: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceSystemTab);
