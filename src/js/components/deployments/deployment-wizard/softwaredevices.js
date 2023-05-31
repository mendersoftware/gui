// Copyright 2019 Northern.tech AS
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
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';
import isUUID from 'validator/lib/isUUID';

import { DEPLOYMENT_TYPES } from '../../../constants/deploymentConstants';
import { ALL_DEVICES } from '../../../constants/deviceConstants';
import { stringToBoolean } from '../../../helpers';
import useWindowSize from '../../../utils/resizehook';
import AsyncAutocomplete from '../../common/asyncautocomplete';
import InfoHint from '../../common/info-hint';
import InfoText from '../../common/infotext';
import { getDeviceIdentityText } from '../../devices/base-devices';

const useStyles = makeStyles()(theme => ({
  infoStyle: {
    minWidth: 400,
    borderBottom: 'none'
  },
  selection: { minWidth: 'min-content', maxWidth: theme.spacing(50), minHeight: 96, marginBottom: theme.spacing(2) }
}));

const hardCodedStyle = {
  textField: {
    minWidth: 400
  }
};

export const getDevicesLink = ({ devices, group, hasFullFiltering, name }) => {
  let devicesLink = '/devices';
  if (devices.length && (!name || isUUID(name))) {
    devicesLink = `${devicesLink}?id=${devices[0].id}`;
    if (hasFullFiltering) {
      devicesLink = `/devices?${devices.map(({ id }) => `id=${id}`).join('&')}`;
    }
    if (devices.length === 1) {
      const { systemDeviceIds = [] } = devices[0];
      devicesLink = `${devicesLink}${systemDeviceIds.map(id => `&id=${id}`).join('')}`;
    }
  } else if (group && group !== ALL_DEVICES) {
    devicesLink = `${devicesLink}?inventory=group:eq:${group}`;
  }
  return devicesLink;
};

export const getDeploymentTargetText = ({ deployment, idAttribute }) => {
  const { devices = [], group = '', name = '', type = DEPLOYMENT_TYPES.software } = deployment;
  const deviceList = Array.isArray(devices) ? devices : Object.values(devices);
  if (type !== DEPLOYMENT_TYPES.configuration && (!deviceList.length || group || (deployment.name !== undefined && !isUUID(name)))) {
    return (group || name) ?? '';
  }
  return deviceList.map(device => getDeviceIdentityText({ device, idAttribute }) ?? device?.id).join(', ');
};

export const ReleasesWarning = ({ lacksReleases }) => (
  <div className="flexbox center-aligned">
    <ErrorOutlineIcon fontSize="small" style={{ marginRight: 4, top: 4, color: 'rgb(171, 16, 0)' }} />
    <InfoText>
      There are no {lacksReleases ? 'compatible ' : ''}artifacts available.{lacksReleases ? <br /> : ' '}
      <Link to="/releases">Upload one to the repository</Link> to get started.
    </InfoText>
  </div>
);

export const Devices = ({
  deploymentObject,
  getSystemDevices,
  groupRef,
  groups,
  hasDevices,
  hasDynamicGroups,
  hasFullFiltering,
  hasPending,
  idAttribute,
  setDeploymentSettings
}) => {
  const { classes } = useStyles();
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const { deploymentDeviceCount = 0, devices = [], group = null } = deploymentObject;
  const device = devices.length === 1 ? devices[0] : {};

  useEffect(() => {
    const { attributes = {} } = device;
    const { mender_is_gateway } = attributes;
    if (!device.id || !stringToBoolean(mender_is_gateway)) {
      return;
    }
    getSystemDevices(device.id, { perPage: 500 });
  }, [device.id, device.attributes?.mender_is_gateway]);

  const deploymentSettingsUpdate = (e, value, reason) => {
    let update = { group: value };
    if (reason === 'clear') {
      update = { ...update, deploymentDeviceCount: 0, devices: [] };
    }
    setDeploymentSettings(update);
  };

  const groupItems = [ALL_DEVICES, ...Object.keys(groups)];
  const { deviceText, devicesLink, targetDeviceCount, targetDevicesText } = useMemo(() => {
    const devicesLink = getDevicesLink({ devices, group, hasFullFiltering });
    let deviceText = getDeploymentTargetText({ deployment: deploymentObject, idAttribute });
    let targetDeviceCount = deploymentDeviceCount;
    let targetDevicesText = `${deploymentDeviceCount} ${pluralize('devices', deploymentDeviceCount)}`;
    if (device?.id) {
      const { attributes = {}, systemDeviceIds = [] } = device;
      const { mender_is_gateway } = attributes;
      deviceText = `${getDeviceIdentityText({ device, idAttribute })}${stringToBoolean(mender_is_gateway) ? ' (System)' : ''}`;
      // here we hope the number of systemDeviceIds doesn't exceed the queried 500 and add the gateway device
      targetDeviceCount = systemDeviceIds.length + 1;
    } else if (group) {
      deviceText = '';
      targetDevicesText = 'All devices';
      targetDeviceCount = 2;
      if (group !== ALL_DEVICES) {
        targetDevicesText = `${targetDevicesText} in this group`;
        targetDeviceCount = deploymentDeviceCount;
      }
    }
    return { deviceText, devicesLink, targetDeviceCount, targetDevicesText };
  }, [devices, group, idAttribute, deploymentDeviceCount]);

  return (
    <>
      <h4 className="margin-bottom-none margin-top-none">Select a device group to target</h4>
      <div ref={groupRef} className={classes.selection}>
        {deviceText ? (
          <TextField value={deviceText} label={pluralize('device', devices.length)} disabled={true} className={classes.infoStyle} />
        ) : (
          <div>
            <Autocomplete
              id="deployment-device-group-selection"
              autoSelect
              autoHighlight
              filterSelectedOptions
              handleHomeEndKeys
              disabled={!(hasDevices || hasDynamicGroups)}
              options={groupItems}
              onChange={deploymentSettingsUpdate}
              renderInput={params => (
                <TextField {...params} placeholder="Select a device group" InputProps={{ ...params.InputProps }} className={classes.textField} />
              )}
              value={group}
            />
            {!(hasDevices || hasDynamicGroups) && (
              <InfoText style={{ marginTop: '10px' }}>
                <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)', position: 'relative' }} />
                There are no connected devices.{' '}
                {hasPending ? (
                  <span>
                    <Link to="/devices/pending">Accept pending devices</Link> to get started.
                  </span>
                ) : (
                  <span>
                    <Link to="/help/get-started">Read the help pages</Link> for help with connecting devices.
                  </span>
                )}
              </InfoText>
            )}
          </div>
        )}
        {!!targetDeviceCount && (
          <InfoText>
            {targetDevicesText} will be targeted. <Link to={devicesLink}>View the {pluralize('devices', targetDeviceCount)}</Link>
          </InfoText>
        )}
      </div>
    </>
  );
};

export const Software = ({
  commonClasses,
  deploymentObject,
  getReleases,
  releaseRef,
  releases,
  releasesById,
  releaseSelectionLocked,
  setDeploymentSettings
}) => {
  const [isLoadingReleases, setIsLoadingReleases] = useState(!releases.length);
  const { classes } = useStyles();
  const { devices = [], release: deploymentRelease = null } = deploymentObject;
  const device = devices.length ? devices[0] : undefined;

  useEffect(() => {
    setIsLoadingReleases(!releases.length);
  }, [releases.length]);

  const releaseItems = useMemo(() => {
    let releaseItems = releases.map(rel => releasesById[rel]);
    if (device && device.attributes) {
      // If single device, don't show incompatible releases
      releaseItems = releaseItems.filter(rel => rel.device_types_compatible.some(type => device.attributes.device_type.includes(type)));
    }
    return releaseItems;
  }, [releases, device]);

  const onReleaseSelectionChange = release => {
    if (release !== deploymentObject.release) {
      setDeploymentSettings({ release });
    }
  };

  const onReleaseInputChange = inputValue => {
    setIsLoadingReleases(!releases.length);
    return getReleases({ page: 1, perPage: 100, searchTerm: inputValue, searchOnly: true }).finally(() => setIsLoadingReleases(false));
  };

  const releaseDeviceTypes = (deploymentRelease && deploymentRelease.device_types_compatible) ?? [];
  const devicetypesInfo = (
    <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
      <span className="link">
        {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
      </span>
    </Tooltip>
  );

  return (
    <>
      <h4 className="margin-bottom-none margin-top-none">Select a Release to deploy</h4>
      <div className={commonClasses.columns}>
        <div ref={releaseRef} className={classes.selection}>
          {releaseSelectionLocked ? (
            <TextField value={deploymentRelease?.Name} label="Release" disabled={true} className={classes.infoStyle} />
          ) : (
            <AsyncAutocomplete
              id="deployment-release-selection"
              initialValue={deploymentRelease?.Name}
              labelAttribute="Name"
              placeholder="Select a Release"
              selectionAttribute="Name"
              options={releaseItems}
              onChange={onReleaseInputChange}
              onChangeSelection={onReleaseSelectionChange}
              isLoading={isLoadingReleases}
              styles={hardCodedStyle}
            />
          )}
          {!releaseItems.length ? (
            <ReleasesWarning lacksReleases />
          ) : (
            !!releaseDeviceTypes.length && <InfoText style={{ marginBottom: 0 }}>This Release is compatible with {devicetypesInfo}.</InfoText>
          )}
        </div>
        <InfoHint content="The deployment will skip any devices in the group that are already on the target Release version, or that have an incompatible device type." />
      </div>
    </>
  );
};
