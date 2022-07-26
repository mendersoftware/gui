import React from 'react';
import pluralize from 'pluralize';
import { useTheme } from '@mui/material/styles';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import { colors } from '../../themes/Mender';
import InfoText from '../common/infotext';

const stateActionMap = {
  [DEVICE_STATES.pending]: 'pending authorization',
  [DEVICE_STATES.rejected]: 'reject',
  [DEVICE_STATES.preauth]: 'preauthorized',
  [DEVICE_STATES.accepted]: 'accepted'
};

export const DeviceStatusNotification = ({ deviceCount, onClick, state }) => {
  const theme = useTheme();
  const pluralized = pluralize('device', deviceCount);
  return (
    <div
      className="clickable margin-right onboard"
      onClick={() => onClick(state)}
      style={{ background: colors.accent2Color, flexGrow: 1, padding: theme.spacing(1.5) }}
    >
      <InfoText variant="dense">
        {deviceCount} {pluralized} {pluralize('is', deviceCount)} {stateActionMap[state]}
      </InfoText>
      <b className="margin-left-small link link-color">View {pluralized}</b>
    </div>
  );
};

export default DeviceStatusNotification;
