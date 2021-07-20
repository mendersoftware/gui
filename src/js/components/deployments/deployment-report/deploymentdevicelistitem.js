import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';

// material ui
import { Button, LinearProgress, TableCell, TableRow } from '@material-ui/core';

import { formatTime, statusToPercentage } from '../../../helpers';
import DeviceIdentityDisplay from '../../common/deviceidentity';

const stateTitleMap = {
  noartifact: 'No compatible artifact found',
  'already-installed': 'Already installed',
  'pause-before-installing': 'Paused before installing',
  'pause-before-rebooting': 'Paused before rebooting',
  'pause-before-committing': 'Paused before committing'
};

const DeploymentDeviceListItem = ({ created: deploymentCreationDate, device, idAttribute, viewLog, retries: maxRetries }) => {
  const { attempts, attributes = {}, created, finished, id = 'id', log, retries, substate, status } = device;

  const softwareName = attributes['rootfs-image.version'] || attributes.artifact_name;
  const encodedArtifactName = encodeURIComponent(softwareName);
  const currentArtifactLink = softwareName ? (
    <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
      {softwareName}
    </Link>
  ) : (
    '-'
  );

  const statusTitle = stateTitleMap[status] || status;

  const intervalsSinceStart = Math.floor((Date.now() - Date.parse(deploymentCreationDate)) / (1000 * 20));
  const devicePercentage = statusToPercentage(status, intervalsSinceStart);
  const progressColor = statusTitle && (statusTitle.toLowerCase() === 'failure' || statusTitle.toLowerCase() === 'aborted') ? 'secondary' : 'primary';

  return (
    <TableRow>
      <TableCell>
        <Link style={{ fontWeight: '500' }} to={`/devices/id=${id}`}>
          <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
        </Link>
      </TableCell>
      <TableCell>{attributes.device_type || '-'}</TableCell>
      <TableCell>{currentArtifactLink}</TableCell>
      <TableCell>{created ? <Time value={formatTime(created)} format="YYYY-MM-DD HH:mm" /> : '-'}</TableCell>
      <TableCell>{finished ? <Time value={formatTime(finished)} format="YYYY-MM-DD HH:mm" /> : '-'}</TableCell>
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
            <div style={{ textAlign: 'end', color: '#aaaaaa' }}>{`${devicePercentage}%`}</div>
            <LinearProgress color={progressColor} variant="determinate" value={devicePercentage} />
          </div>
        )}
      </TableCell>
      <TableCell>{log ? <Button onClick={() => viewLog(id)}>View log</Button> : null}</TableCell>
    </TableRow>
  );
};

export default DeploymentDeviceListItem;
