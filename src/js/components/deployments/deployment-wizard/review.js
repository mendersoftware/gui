import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Chip, List } from '@material-ui/core';

import { formatTime, generateDeploymentGroupDetails, getPhaseDeviceCount, getRemainderPercent } from '../../../helpers';
import EnterpriseNotification from '../../common/enterpriseNotification';
import ExpandableAttribute from '../../common/expandable-attribute';
import { getPhaseStartTime } from '../createdeployment';

const Review = ({
  deployment = {},
  deploymentDeviceCount,
  device,
  filterId,
  filters,
  group,
  isEnterprise,
  phases = [{ batch_size: 100 }],
  release,
  retries = 0
}) => {
  const creationTime = deployment.created || new Date().toISOString();
  const start_time = phases[0].start_ts || creationTime;
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
      { primary: 'Created at', secondary: <Time value={creationTime} format="YYYY-MM-DD HH:mm" />, secondaryTypographyProps: { title: creationTime } },
      { primary: 'Start time', secondary: <Time value={start_time} format="YYYY-MM-DD HH:mm" />, secondaryTypographyProps: { title: start_time } },
      {
        primary: 'End time',
        secondary: end_time ? <Time value={end_time} format="YYYY-MM-DD HH:mm" /> : '-',
        secondaryTypographyProps: { title: end_time || '-' }
      }
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
                <ExpandableAttribute key={item.primary} {...item} dividerDisabled={true} style={{ marginBottom: -15 }} />
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
          {phases.map((row, index) => {
            row.batch_size = row.batch_size || getRemainderPercent(phases);
            const deviceCount = getPhaseDeviceCount(
              deployment.max_devices || deploymentDeviceCount,
              row.batch_size,
              row.batch_size,
              index === phases.length - 1
            );
            const deviceCountText = !filterId ? ` (${deviceCount} ${pluralize('device', deviceCount)})` : '';
            const startTime = getPhaseStartTime(phases, index, start_time);
            return (
              <div className="flexbox column" key={startTime}>
                <Chip size="small" label={`Phase ${index + 1}`} />
                <div>
                  <Time value={startTime} format="YYYY-MM-DD HH:mm" />
                </div>
                <div>{`${row.batch_size}%${deviceCountText}`}</div>
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
