import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Chip, List, ListItem, ListItemText } from '@material-ui/core';

import { DEPLOYMENT_TYPES } from '../../../constants/deploymentConstants';
import { formatTime, generateDeploymentGroupDetails, getPhaseDeviceCount, getRemainderPercent } from '../../../helpers';
import EnterpriseNotification from '../../common/enterpriseNotification';
import ExpandableAttribute from '../../common/expandable-attribute';
import { getPhaseStartTime } from '../createdeployment';
import ConfigurationObject from '../../common/configurationobject';
import RolloutSteps from './rolloutsteps';

export const RolloutSchedule = ({ deployment, deploymentDeviceCount, filterId, phases, start_time }) => {
  return (
    <>
      <h5>Rollout Schedule</h5>
      <div className="flexbox deployment-phases-list margin-top-small margin-bottom-small">
        <div className="flexbox column align-right">
          <div>Phase begins</div>
          <div>Batch size</div>
        </div>
        {phases.map((row, index) => {
          row.batch_size = row.batch_size || getRemainderPercent(phases);
          const deviceCount = getPhaseDeviceCount(deployment.max_devices || deploymentDeviceCount, row.batch_size, row.batch_size, index === phases.length - 1);
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
    </>
  );
};

const Review = ({ deployment = {}, deploymentObject = {}, docsVersion, filterId, filters, isEnterprise }) => {
  const {
    deploymentDeviceCount,
    device,
    group,
    phases = [{ batch_size: 100 }],
    release = { device_types_compatible: [] },
    retries = 0,
    update_control_map = {}
  } = deploymentObject;

  const { states: rolloutSteps } = update_control_map;

  const creationTime = deployment.created || new Date().toISOString();
  const start_time = phases[0].start_ts || creationTime;
  const end_time = null || formatTime(deployment.finished);
  const deploymentInformation = [
    {
      primary: device ? 'Target device' : 'Device Group',
      secondary: device ? device.id : generateDeploymentGroupDetails(deployment.filter || { terms: filters }, group)
    },
    { primary: 'Release', secondary: release.Name },
    { primary: 'Device types compatible', secondary: release.device_types_compatible.join(', ') },
    { primary: 'Number of attempts per device', secondary: retries },
    { primary: 'Start time', secondary: <Time value={start_time} format="YYYY-MM-DD HH:mm" />, secondaryTypographyProps: { title: start_time } },
    {
      primary: 'End time',
      secondary: end_time ? <Time value={end_time} format="YYYY-MM-DD HH:mm" /> : '-',
      secondaryTypographyProps: { title: end_time || '-' }
    }
  ];
  const { type = DEPLOYMENT_TYPES.software, devices = {} } = deployment;
  if (type === DEPLOYMENT_TYPES.configuration) {
    const generalItems = [
      { primary: 'Release', secondary: type },
      { primary: `Target device(s)`, secondary: Object.keys(devices).join(', ') }
    ];
    deploymentInformation.splice(0, 3, ...generalItems);
    const config = JSON.parse(atob(deployment.configuration));
    deploymentInformation.push({
      component: (
        <ListItem disabled key="Configuration">
          <ListItemText
            primary="Configuration"
            secondary={<ConfigurationObject className="margin-top-small" compact config={config} />}
            secondaryTypographyProps={{ title: atob(deployment.configuration), component: 'div' }}
          />
        </ListItem>
      )
    });
  }

  return (
    <div className="margin-small">
      <h4>Deployment summary</h4>
      <List className="two-columns">
        {deploymentInformation.map(item =>
          item.component ? item.component : <ExpandableAttribute key={item.primary} {...item} dividerDisabled style={{ marginBottom: -15 }} />
        )}
      </List>
      {phases.length > 1 ? (
        <RolloutSchedule deployment={deployment} deploymentDeviceCount={deploymentDeviceCount} filterId={filterId} phases={phases} start_time={start_time} />
      ) : (
        <>
          <h5 className="margin-left-small">Pauses</h5>
          <RolloutSteps className="margin-left-small" docsVersion={docsVersion} isEnterprise={isEnterprise} steps={rolloutSteps} />
        </>
      )}
      {<EnterpriseNotification isEnterprise={isEnterprise} benefit="deployment roll outs in multiple phases and on schedule, as well as deployment retries" />}
    </div>
  );
};

export default Review;
