import React from 'react';

import pluralize from 'pluralize';

import { Chip, List } from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import ExpandableDeviceAttribute from '../../devices/expandable-device-attribute';
import { getRemainderPercent } from '../../../helpers';

const Review = props => {
  const { deploymentDeviceIds, device, group, isEnterprise, phases, release } = props;

  // Create 'phases' for view only
  var deploymentPhases = phases ? phases : [{batch_size: 100, start_ts: new Date()}];
  deploymentPhases[0].start_ts = deploymentPhases[0].start_ts || new Date();
  const start_time = deploymentPhases[0].start_ts;

  const deploymentInformation = [
    { primary: 'Release', secondary: release.name },
    { primary: `Device${device ? '' : ' group'}`, secondary: device ? device.id : group },
    { primary: 'Device types compatible', secondary: release.device_types_compatible.join(', ') },
    { primary: '# devices', secondary: deploymentDeviceIds.length },
    { primary: 'Start time', secondary: start_time ? start_time.toLocaleString() : new Date().toLocaleString() }
  ];

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
              style={{ flexBasis: 240, margin: '-5px 0' }}
              dividerDisabled={true}
            />
          ))}
        </List>

        <h4 className="margin-bottom-none">Rollout Schedule</h4>

        <div className="flexbox deployment-phases-list margin-top-small">
          <div className="flexbox column align-right">
            <div>Phase begins</div>
            <div>Batch size</div>
          </div>
          {deploymentPhases.map((row, index) => {
            row.batch_size = row.batch_size || getRemainderPercent(deploymentPhases);
            const deviceCount = (index === deploymentPhases.length-1) 
              ? Math.ceil((deploymentDeviceIds.length / 100) * row.batch_size)
              : Math.floor((deploymentDeviceIds.length / 100) * row.batch_size);
            return (
              <div className="flexbox column" key={row.start_ts}>
                <Chip size="small" label={`Phase ${index + 1}`} />
                <div>{row.start_ts.toLocaleString()}</div>
                <div>{`${row.batch_size}% (${deviceCount}) ${pluralize('device', deviceCount)}`}</div>
              </div>
            );
          })}
        </div>
        {!isEnterprise && (
          <p className="info icon">
            <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
            {`Hosted Mender & Mender Enterprise users can choose to roll out their deployments delayed or in multiple phases. ${(
              <a href="https://mender.io">Learn more</a>
            )}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Review;
