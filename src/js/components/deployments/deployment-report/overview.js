import React from 'react';
import { Link } from 'react-router-dom';

import { Launch as LaunchIcon, ArrowDropDownCircleOutlined as ScrollDownIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';
import isUUID from 'validator/lib/isUUID';

import failImage from '../../../../assets/img/largeFail.png';
import successImage from '../../../../assets/img/largeSuccess.png';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../../constants/deploymentConstants';
import { groupDeploymentStats } from '../../../helpers';
import { TwoColumnData } from '../../common/configurationobject';
import DeviceIdentityDisplay from '../../common/deviceidentity';
import Time from '../../common/time';
import { getDevicesLink } from '../deployment-wizard/softwaredevices';
import { defaultColumnDataProps } from '../report';

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

export const DeploymentOverview = ({ creator, deployment, devicesById, idAttribute, onScheduleClick, tenantCapabilities }) => {
  const { classes } = useStyles();
  const { artifact_name, devices = {}, filter, group, status, totalDeviceCount } = deployment;
  const { failures, successes } = groupDeploymentStats(deployment);
  const { hasFullFiltering } = tenantCapabilities;

  const finished = deployment.finished || status === DEPLOYMENT_STATES.finished;

  const { created: creationTime = new Date().toISOString(), name = '', type = DEPLOYMENT_TYPES.software } = deployment;
  const isSoftwareDeployment = type === DEPLOYMENT_TYPES.software;
  let deploymentRelease = (
    <Link {...defaultLinkProps} to={`/releases/${encodeURIComponent(artifact_name)}`}>
      {artifact_name}
      <LaunchIcon className="margin-left-small" fontSize="small" />
    </Link>
  );
  const isDeviceDeployment = isUUID(name) && Object.keys(devices).length === 1;
  const devicesLink = getDevicesLink({ devices: Object.values(devices), group, hasFullFiltering, name });
  let targetDevices = (
    <Link {...defaultLinkProps} to={devicesLink}>
      {isDeviceDeployment && devicesById[name] ? (
        <DeviceIdentityDisplay device={devicesById[name]} idAttribute={idAttribute} isEditable={false} />
      ) : isUUID(name) ? (
        Object.keys(devices).join(', ')
      ) : (
        name
      )}
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

      {finished && (
        <div className="statusLarge flexbox centered">
          <img src={successes ? successImage : failImage} />
          <div className={`statusWrapper flexbox centered ${classes.statusWrapper}`}>
            <div className="statusWrapperMessage">
              {(!!successes || !failures) && (
                <>
                  <b className={successes ? 'green' : 'red'}>
                    {successes === totalDeviceCount && totalDeviceCount > 1 && <>All </>}
                    {successes}
                  </b>{' '}
                  {pluralize('devices', successes)} updated successfully
                </>
              )}
              {!!failures && (
                <>
                  <b className="red">{failures}</b> {pluralize('devices', failures)} failed to update
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentOverview;
