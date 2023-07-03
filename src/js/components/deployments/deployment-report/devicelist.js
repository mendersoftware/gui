// Copyright 2017 Northern.tech AS
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
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// material ui
import { Button, LinearProgress } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import DeltaIcon from '../../../../assets/img/deltaicon.svg';
import { TIMEOUTS, canAccess as canShow } from '../../../constants/appConstants';
import { deploymentSubstates } from '../../../constants/deploymentConstants';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import { rootfsImageVersion as rootfsImageVersionAttribute } from '../../../constants/releaseConstants';
import { FileSize, formatTime } from '../../../helpers';
import { TwoColumns } from '../../common/configurationobject';
import DetailsTable from '../../common/detailstable';
import DeviceIdentityDisplay from '../../common/deviceidentity';
import Loader from '../../common/loader';
import MenderTooltip from '../../common/mendertooltip';
import Pagination from '../../common/pagination';
import { MaybeTime } from '../../common/time';

const useStyles = makeStyles()(() => ({
  table: { minHeight: '10vh', maxHeight: '40vh', overflowX: 'auto' }
}));

const { page: defaultPage } = DEVICE_LIST_DEFAULTS;

const stateTitleMap = {
  noartifact: 'No compatible artifact found',
  'already-installed': 'Already installed',
  'pause-before-installing': 'Paused before installing',
  'pause-before-rebooting': 'Paused before rebooting',
  'pause-before-committing': 'Paused before committing'
};

const determinedStateMap = {
  'noartifact': 0,
  'aborted': 100,
  'already-installed': 100,
  'failure': 100,
  'success': 100
};

const statusColorMap = {
  failure: 'secondary',
  aborted: 'secondary',
  default: 'primary'
};

const undefinedStates = [deploymentSubstates.pending, deploymentSubstates.decommissioned, deploymentSubstates.alreadyInstalled];

const deviceListColumns = [
  {
    key: 'idAttribute',
    title: 'id',
    renderTitle: ({ idAttribute }) => idAttribute,
    render: ({ device, idAttribute }) => (
      <Link style={{ fontWeight: 'initial', opacity: idAttribute === 'name' ? 0.6 : 1 }} to={`/devices?id=${device.id}`}>
        <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
      </Link>
    ),
    canShow
  },
  {
    key: 'device-type',
    title: 'Device Type',
    render: ({ device }) => {
      const { attributes = {} } = device;
      const { device_type: deviceTypes = [] } = attributes;
      return deviceTypes.length ? deviceTypes.join(',') : '-';
    },
    canShow
  },
  {
    key: 'current-software',
    title: 'Current software',
    render: ({ device: { attributes = {} }, userCapabilities: { canReadReleases } }) => {
      const { artifact_name, [rootfsImageVersionAttribute]: rootfsImageVersion } = attributes;
      const softwareName = rootfsImageVersion || artifact_name;
      const encodedArtifactName = encodeURIComponent(softwareName);
      return softwareName ? (
        canReadReleases ? (
          <Link style={{ fontWeight: 'initial' }} to={`/releases/${encodedArtifactName}`}>
            {softwareName}
          </Link>
        ) : (
          softwareName
        )
      ) : (
        '-'
      );
    },
    canShow
  },
  { key: 'started', title: 'Started', render: ({ device: { created } }) => <MaybeTime value={formatTime(created)} />, sortable: false, canShow },
  { key: 'finished', title: 'Finished', render: ({ device: { finished } }) => <MaybeTime value={formatTime(finished)} />, sortable: false, canShow },
  {
    key: 'artifact_size',
    title: 'Artifact size',
    render: ({ device: { image = {} } }) => {
      const { size } = image;
      return <FileSize fileSize={size} />;
    },
    sortable: false,
    canShow
  },
  {
    key: 'delta',
    title: '',
    render: ({ device: { isDelta } }) =>
      isDelta ? (
        <MenderTooltip placement="bottom" title="Device is enabled for delta updates">
          <DeltaIcon />
        </MenderTooltip>
      ) : (
        ''
      ),
    canShow
  },
  {
    key: 'attempts',
    title: 'Attempts',
    render: ({ device: { attempts, retries } }) => (attempts || 1) / (retries + 1),
    canShow: ({ deployment: { retries } }) => !!retries
  },
  {
    key: 'status',
    title: 'Deployment status',
    render: ({ device: { substate, status = '' } }) => {
      const statusTitle = stateTitleMap[status] || status;
      const progressColor = statusColorMap[statusTitle.toLowerCase()] ?? statusColorMap.default;
      const devicePercentage = determinedStateMap[status];
      return (
        <>
          {substate ? (
            <div className="flexbox">
              <div className="capitalized-start" style={{ verticalAlign: 'top' }}>{`${statusTitle}: `}</div>
              <div className="substate">{substate}</div>
            </div>
          ) : (
            statusTitle
          )}
          {!undefinedStates.includes(status.toLowerCase()) && (
            <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
              <LinearProgress color={progressColor} value={devicePercentage} variant={devicePercentage !== undefined ? 'determinate' : 'indeterminate'} />
            </div>
          )}
        </>
      );
    },
    canShow
  },
  {
    key: 'log',
    title: '',
    render: ({ device: { id, log }, viewLog }) => (log ? <Button onClick={() => viewLog(id)}>View log</Button> : null),
    canShow
  }
];

const ValueFileSize = ({ value, ...props }) => <FileSize fileSize={value} {...props} />;

export const DeploymentDeviceList = ({
  deployment,
  getDeploymentDevices,
  getDeviceAuth,
  getDeviceById,
  idAttribute,
  selectedDeviceIds,
  selectedDevices,
  userCapabilities,
  viewLog
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [loadingDone, setLoadingDone] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const { device_count = 0, totalDeviceCount: totalDevices, statistics = {} } = deployment;
  const totalSize = statistics.total_size ?? 0;
  const totalDeviceCount = totalDevices ?? device_count;
  const timer = useRef();
  const { classes } = useStyles();

  useEffect(() => {
    setCurrentPage(defaultPage);
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
  }, [selectedDeviceIds]);

  useEffect(() => {
    if (!(deployment.id && loadingDone)) {
      return;
    }
    getDeploymentDevices(deployment.id, { page: currentPage, perPage });
  }, [currentPage, deployment.status, JSON.stringify(statistics.status), loadingDone]);

  useEffect(() => {
    timer.current = setTimeout(() => setLoadingDone(true), TIMEOUTS.oneSecond);
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const onChangeSorting = sortingColumn => {
    console.log(sortingColumn);
  };

  const columns = deviceListColumns.reduce((accu, column) => (column.canShow({ deployment }) ? [...accu, { ...column, extras: { idAttribute } }] : accu), []);
  const items = selectedDevices.map(device => ({ device, id: device.id, idAttribute, userCapabilities, viewLog }));
  return (
    <>
      <Loader show={!loadingDone} />
      {!!totalDeviceCount && (
        <div>
          <DetailsTable className={classes.table} columns={columns} items={items} onChangeSorting={onChangeSorting} />
          <div className="flexbox space-between center-aligned margin-top">
            <Pagination
              className="margin-top-none"
              count={totalDeviceCount}
              rowsPerPage={perPage}
              onChangePage={setCurrentPage}
              onChangeRowsPerPage={setPerPage}
              page={currentPage}
            />
            <TwoColumns chipLikeKey={false} compact items={{ 'Total download size': totalSize }} ValueComponent={ValueFileSize} />
          </div>
        </div>
      )}
    </>
  );
};

export default DeploymentDeviceList;
