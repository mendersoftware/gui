import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import { Button, LinearProgress, TableCell, TableRow } from '@material-ui/core';

import { formatTime } from '../../../helpers';
import DeviceIdentityDisplay from '../../common/deviceidentity';
import LocaleTime from '../../common/localetime';

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

const DeploymentDeviceListItem = ({ device, idAttribute, viewLog, retries: maxRetries }) => {
  const { attempts, attributes = {}, created, finished, id = 'id', log, retries, substate, status } = device;

  const { artifact_name, device_type: deviceTypes = [], ['rootfs-image.version']: rootfsImageVersion } = attributes;
  const softwareName = rootfsImageVersion || artifact_name;
  const encodedArtifactName = encodeURIComponent(softwareName);
  const currentArtifactLink = softwareName ? (
    <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
      {softwareName}
    </Link>
  ) : (
    '-'
  );

  const statusTitle = stateTitleMap[status] || status;

  const devicePercentage = determinedStateMap[status];

  const progressColor = statusTitle && (statusTitle.toLowerCase() === 'failure' || statusTitle.toLowerCase() === 'aborted') ? 'secondary' : 'primary';

  return (
    <TableRow>
      <TableCell>
        <Link style={{ fontWeight: '500' }} to={`/devices?id=${id}`}>
          <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
        </Link>
      </TableCell>
      <TableCell>{deviceTypes.length ? deviceTypes.join(',') : '-'}</TableCell>
      <TableCell>{currentArtifactLink}</TableCell>
      <TableCell>{created ? <LocaleTime value={formatTime(created)} /> : '-'}</TableCell>
      <TableCell>{finished ? <LocaleTime value={formatTime(finished)} /> : '-'}</TableCell>
      {retries ? (
        <TableCell>
          {attempts || 1}/{(retries || maxRetries) + 1}
        </TableCell>
      ) : null}
      <TableCell style={{ paddingRight: '0px', position: 'relative', minWidth: 200 }}>
        {substate ? (
          <div className="flexbox">
            <div className="capitalized-start" style={{ verticalAlign: 'top' }}>{`${statusTitle}: `}</div>
            <div className="substate">{substate}</div>
          </div>
        ) : (
          statusTitle
        )}
        {!['pending', 'decommissioned', 'already-installed'].includes(status.toLowerCase()) && (
          <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <LinearProgress color={progressColor} value={devicePercentage} variant={devicePercentage !== undefined ? 'determinate' : 'indeterminate'} />
          </div>
        )}
      </TableCell>
      <TableCell>{log ? <Button onClick={() => viewLog(id)}>View log</Button> : null}</TableCell>
    </TableRow>
  );
};

export default DeploymentDeviceListItem;
