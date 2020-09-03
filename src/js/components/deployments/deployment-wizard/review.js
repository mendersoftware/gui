import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Chip, List } from '@material-ui/core';

import EnterpriseNotification from '../../common/enterpriseNotification';
import ExpandableAttribute from '../../common/expandable-attribute';
import { formatTime, generateDeploymentGroupDetails, getRemainderPercent } from '../../../helpers';

const Review = ({ deployment = {}, deploymentDeviceCount, device, filters, group, isEnterprise, phases, release, retries = 0 }) => {
  // Create 'phases' for view only
  const deploymentPhases = phases || [{ batch_size: 100 }];
  const start_time = deploymentPhases[0].start_ts || deployment.created || new Date().toISOString();
  const end_time = null || formatTime(deployment.finished);

  const deploymentInformation = {
    General: [
      { primary: 'Release', secondary: release.Name },
      { primary: 'Device types compatible', secondary: release.device_types_compatible.join(', ') },
      {
        primary: `Device${device ? '' : ' group'}`,
        secondary: device ? device.id : generateDeploymentGroupDetails(deployment.filter || { terms: filters }, group)
      },
      { primary: 'Number of retries', secondary: retries }
    ],
    Schedule: [
      { primary: 'Created at', secondary: <Time value={deployment.created || new Date().toISOString()} format="YYYY-MM-DD HH:mm" /> },
      { primary: 'Start time', secondary: <Time value={start_time} format="YYYY-MM-DD HH:mm" /> },
      { primary: 'End time', secondary: end_time ? <Time value={end_time} format="YYYY-MM-DD HH:mm" /> : '-' }
    ]
  };

  return (
    <div className="margin-small">
      <div className="two-columns">
        {Object.entries(deploymentInformation).map(([title, information]) => (
          <div key={title}>
            <h4 className="dashboard-header">
              <span>{title}</span>
            </h4>
            <List>
              {information.map(item => (
                <ExpandableAttribute
                  key={item.primary}
                  primary={item.primary}
                  secondary={item.secondary}
                  dividerDisabled={true}
                  style={{ marginBottom: -15 }}
                />
              ))}
            </List>
          </div>
        ))}
      </div>
      <div>
        <h4 className="dashboard-header">
          <span>Rollout Schedule</span>
        </h4>
        <div className="flexbox deployment-phases-list margin-top-small margin-bottom-small">
          <div className="flexbox column align-right">
            <div>Phase begins</div>
            <div>Batch size</div>
          </div>
          {deploymentPhases.map((row, index) => {
            row.batch_size = row.batch_size || getRemainderPercent(deploymentPhases);
            const deviceCount =
              index === deploymentPhases.length - 1
                ? Math.ceil(((deployment.max_devices || deploymentDeviceCount) / 100) * row.batch_size)
                : Math.floor(((deployment.max_devices || deploymentDeviceCount) / 100) * row.batch_size);
            return (
              <div className="flexbox column" key={row.start_ts || start_time}>
                <Chip size="small" label={`Phase ${index + 1}`} />
                <div>
                  <Time value={row.start_ts || start_time} format="YYYY-MM-DD HH:mm" />
                </div>
                <div>{`${row.batch_size}% (${deviceCount} ${pluralize('device', deviceCount)})`}</div>
              </div>
            );
          })}
        </div>
      </div>
      {<EnterpriseNotification isEnterprise={isEnterprise} benefit="deployment roll outs in multiple phases and on schedule, as well as deployment retries" />}
    </div>
  );
};

export default Review;
