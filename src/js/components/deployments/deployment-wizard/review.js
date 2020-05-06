import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Chip, List } from '@material-ui/core';

import EnterpriseNotification from '../../common/enterpriseNotification';
import ExpandableAttribute from '../../common/expandable-attribute';
import { PLANS as plans } from '../../../constants/appConstants';
import { formatTime, getRemainderPercent } from '../../../helpers';

const Review = ({ deployment = {}, deploymentDeviceIds, device, group, isEnterprise, isHosted, phases, plan, release, retries = 0 }) => {
  // Create 'phases' for view only
  const deploymentPhases = phases || [{ batch_size: 100 }];
  const start_time = deploymentPhases[0].start_ts || deployment.created || new Date().toISOString();
  const end_time = null || formatTime(deployment.finished);

  const deploymentInformation = {
    General: [
      { primary: 'Release', secondary: release.Name },
      { primary: 'Device types compatible', secondary: release.device_types_compatible.join(', ') },
      { primary: `Device${device ? '' : ' group'}`, secondary: device ? device.id : group },
      { primary: 'Number of retries', secondary: retries }
    ],
    Schedule: [
      { primary: 'Created at', secondary: <Time value={deployment.created || new Date().toISOString()} format="YYYY-MM-DD HH:mm" /> },
      { primary: 'Start time', secondary: <Time value={start_time} format="YYYY-MM-DD HH:mm" /> },
      { primary: 'End time', secondary: end_time ? <Time value={end_time} format="YYYY-MM-DD HH:mm" /> : '-' }
    ]
  };

  const planKeys = Object.keys(plans);
  const planIndex = !isEnterprise || !plan === 'enterprise' ? planKeys.indexOf(plan) : planKeys.length - 1;
  const recommendedPlan = planKeys[planIndex + 1];

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
                ? Math.ceil((deploymentDeviceIds.length / 100) * row.batch_size)
                : Math.floor((deploymentDeviceIds.length / 100) * row.batch_size);
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
      {!isEnterprise && (!isHosted || (isHosted && plan !== 'enterprise')) && (
        <EnterpriseNotification
          isEnterprise={isEnterprise}
          benefit={`choose to ${plan === 'os' ? 'retry, schedule or ' : ''}roll out deployments in multiple phases`}
          recommendedPlan={isHosted ? recommendedPlan : null}
        />
      )}
    </div>
  );
};

export default Review;
