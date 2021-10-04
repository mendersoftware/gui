import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import pluralize from 'pluralize';
import isUUID from 'validator/lib/isUUID';

import { Chip } from '@material-ui/core';
import { ArrowDropDownCircleOutlined as ScrollDownIcon, Launch as LaunchIcon } from '@material-ui/icons';

import successImage from '../../../../assets/img/largeSuccess.png';
import failImage from '../../../../assets/img/largeFail.png';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../../constants/deploymentConstants';
import { TwoColumnData } from '../../common/configurationobject';
import theme from '../../../themes/mender-theme';
import { defaultColumnDataProps } from '../report';

const defaultLinkProps = {
  className: 'flexbox centered',
  style: { fontWeight: '500' },
  target: '_blank',
  rel: 'noopener noreferrer'
};

export const DeploymentOverview = ({ creator, deployment, onScheduleClick }) => {
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
  const deviceQuery = isUUID(name) ? `id=${name}` : `group=${encodeURIComponent(name)}`;
  let targetDevices = (
    <Link {...defaultLinkProps} to={`/devices?${deviceQuery}`}>
      {name}
      <LaunchIcon className="margin-left-small" fontSize="small" />
      <Chip
        className="margin-left uppercased"
        label={filter ? 'dynamic' : 'static'}
        size="small"
        style={{
          opacity: 0.5,
          fontSize: '0.675rem',
          height: 18
        }}
      />
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
    'Created at': <Time value={creationTime} format="YYYY-MM-DD HH:mm" />
  };

  return (
    <div className="report-container margin-top-large margin-bottom-large">
      <TwoColumnData config={deploymentInfo} {...defaultColumnDataProps} />
      <div className="flexbox column">
        <TwoColumnData config={deploymentInfo2} {...defaultColumnDataProps} />
        <a className="margin-top-small flexbox center-aligned" onClick={onScheduleClick} style={{ ...defaultLinkProps, marginLeft: theme.spacing(8) }}>
          Schedule details <ScrollDownIcon fontSize="small" style={{ marginLeft: theme.spacing() }} />
        </a>
      </div>

      {finished && !!(stats.failure || stats.aborted || stats.success || (stats.failure == 0 && stats.aborted == 0)) && (
        <div className="statusLarge flexbox centered">
          <img src={stats.success ? successImage : failImage} />
          <div className="statusWrapper flexbox centered">
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
