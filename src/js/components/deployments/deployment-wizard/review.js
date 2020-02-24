import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';

import { Chip, List } from '@material-ui/core';

import ExpandableDeviceAttribute from '../../devices/expandable-device-attribute';
import { PLANS as plans } from '../../../constants/appConstants';
import { getRemainderPercent } from '../../../helpers';
import EnterpriseNotification from '../../common/enterpriseNotification';

const Review = ({ deploymentDeviceIds, device, group, isEnterprise, isHosted, phases, plan, release }) => {
  // Create 'phases' for view only
  var deploymentPhases = phases ? phases : [{ batch_size: 100 }];
  const start_time = deploymentPhases[0].start_ts || new Date().toISOString();

  const deploymentInformation = [
    { primary: 'Release', secondary: release.Name },
    { primary: 'Device types compatible', secondary: release.device_types_compatible.join(', '), wide: true },
    { primary: `Device${device ? '' : ' group'}`, secondary: device ? device.id : group },
    { primary: '# devices', secondary: deploymentDeviceIds.length },
    { primary: 'Start time', secondary: <Time value={start_time} format="YYYY-MM-DD HH:mm" /> }
  ];

  const planKeys = Object.keys(plans);
  const planIndex = !isEnterprise || !plan === 'enterprise' ? planKeys.indexOf(plan) : planKeys.length - 1;
  const recommendedPlan = planKeys[planIndex + 1];

  return (
    <div className="flexbox centered column">
      <div className="bordered">
        <h4 className="margin-bottom-none">Review deployment details</h4>

        <List className="list-horizontal-flex">
          {deploymentInformation.map(item => (
            <ExpandableDeviceAttribute
              key={item.primary}
              primary={item.primary}
              secondary={item.secondary}
              style={item.wide ? { flexBasis: 480, margin: '-5px 0' } : { flexBasis: 240, margin: '-5px 0' }}
              dividerDisabled={true}
            />
          ))}
        </List>

        <h4 className="margin-bottom-none">Rollout Schedule</h4>

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
        {isHosted && plan !== 'enterprise' && (
          <EnterpriseNotification
            isEnterprise={isEnterprise}
            benefit={`choose to ${plan === 'os' ? 'schedule or ' : ''}roll out deployments in multiple phases`}
            recommendedPlan={recommendedPlan}
          />
        )}
      </div>
    </div>
  );
};

export default Review;
