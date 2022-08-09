import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import isUUID from 'validator/lib/isUUID';

import { Chip } from '@mui/material';
import { ArrowDropDownCircleOutlined as ScrollDownIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import successImage from '../../../../assets/img/largeSuccess.png';
import failImage from '../../../../assets/img/largeFail.png';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../../constants/deploymentConstants';
import { TwoColumnData } from '../../common/configurationobject';
import Time from '../../common/time';
import { defaultColumnDataProps } from '../report';
import DeviceIdentityDisplay from '../../common/deviceidentity';

const useStyles = makeStyles()(theme => ({
  chip: {
    opacity: 0.5,
    fontSize: '0.675rem',
    height: 18
  },
  scheduleLink: {
    marginLeft: theme.spacing(12),
    '&svg': {
      marginLeft: theme.spacing()
    }
  },
  statusWrapper: {
    backgroundColor: theme.palette.background.lightgrey,
    ['&:after']: {
      borderRight: '20px solid',
      borderRightColor: theme.palette.background.lightgrey
    }
  }
}));

const defaultLinkProps = {
  className: 'flexbox centered',
  style: { fontWeight: '500' },
  target: '_blank',
  rel: 'noopener noreferrer'
};

export const DeploymentOverview = ({ creator, deployment, devicesById, idAttribute, onScheduleClick }) => {
  const { classes } = useStyles();
  const { artifact_name, devices = {}, filter, stats = {}, status, totalDeviceCount } = deployment;

  const finished = deployment.finished || status === DEPLOYMENT_STATES.finished;

  const { created: creationTime = new Date().toISOString(), name = '', type = DEPLOYMENT_TYPES.software } = deployment;
  const isSoftwareDeployment = type === DEPLOYMENT_TYPES.software;
  let deploymentRelease = (
    <Link {...defaultLinkProps} to={`/releases/${encodeURIComponent(artifact_name)}`}>
      {artifact_name}
      <LaunchIcon className="margin-left-small" fontSize="small" />
    </Link>
  );
  const isDeviceDeployment = isUUID(name);
  const deviceQuery = isDeviceDeployment ? `id=${name}` : `group=${encodeURIComponent(name)}`;
  let targetDevices = (
    <Link {...defaultLinkProps} to={`/devices?${deviceQuery}`}>
      {isDeviceDeployment && devicesById[name] ? <DeviceIdentityDisplay device={devicesById[name]} idAttribute={idAttribute} isEditable={false} /> : name}
      <LaunchIcon className="margin-left-small" fontSize="small" />
      <Chip className={`margin-left uppercased ${classes.chip}`} label={filter ? 'dynamic' : 'static'} size="small" />
    </Link>
  );

  if (!isSoftwareDeployment) {
    deploymentRelease = type;
    targetDevices = Object.keys(devices).join(', ') || name;
  }

  const deploymentInfo = {
    'Release': deploymentRelease,
    'Target device(s)': targetDevices,
    'Category': isSoftwareDeployment ? 'Software update' : 'Configuration'
  };
  const createdBy = creator ? { 'Created by': creator } : {};
  const deploymentInfo2 = {
    ...createdBy,
    'Created at': <Time value={creationTime} />
  };

  return (
    <div className="report-container margin-top-large margin-bottom-large">
      <TwoColumnData config={deploymentInfo} {...defaultColumnDataProps} />
      <div className="flexbox column">
        <TwoColumnData config={deploymentInfo2} {...defaultColumnDataProps} />
        <a className={`margin-top-small flexbox center-aligned ${classes.scheduleLink}`} onClick={onScheduleClick}>
          Schedule details <ScrollDownIcon fontSize="small" />
        </a>
      </div>

      {finished && !!(stats.failure || stats.aborted || stats.success || (stats.failure == 0 && stats.aborted == 0)) && (
        <div className="statusLarge flexbox centered">
          <img src={stats.success ? successImage : failImage} />
          <div className={`statusWrapper flexbox centered ${classes.statusWrapper}`}>
            <div className="statusWrapperMessage">
              {!!stats.success && (
                <div>
                  <b className="green">
                    {stats.success === totalDeviceCount && <span>All </span>}
                    {stats.success}
                  </b>{' '}
                  {pluralize('devices', stats.success)} updated successfully
                </div>
              )}
              {stats.success == 0 && stats.failure == 0 && stats.aborted == 0 && (
                <div>
                  <b className="red">0</b> devices updated successfully
                </div>
              )}
              {!!(stats.failure || stats.aborted) && (
                <div>
                  <b className="red">{stats.failure || stats.aborted}</b> {pluralize('devices', stats.failure)} failed to update
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentOverview;
