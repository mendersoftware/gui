import React from 'react';
import pluralize from 'pluralize';
import { makeStyles } from 'tss-react/mui';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import InfoText from '../common/infotext';

const useStyles = makeStyles()(theme => ({
  default: {
    background: theme.palette.grey[400],
    flexGrow: 1,
    padding: theme.spacing(1.5)
  }
}));

const stateActionMap = {
  [DEVICE_STATES.pending]: 'pending authorization',
  [DEVICE_STATES.rejected]: 'reject',
  [DEVICE_STATES.preauth]: 'preauthorized',
  [DEVICE_STATES.accepted]: 'accepted'
};

export const DeviceStatusNotification = ({ deviceCount, onClick, state }) => {
  const { classes } = useStyles();
  const pluralized = pluralize('device', deviceCount);
  return (
    <div className={`clickable margin-right onboard ${classes.default}`} onClick={() => onClick(state)}>
      <InfoText variant="dense">
        {deviceCount} {pluralized} {pluralize('is', deviceCount)} {stateActionMap[state]}
      </InfoText>
      <b className="margin-left-small link link-color">View {pluralized}</b>
    </div>
  );
};

export default DeviceStatusNotification;
