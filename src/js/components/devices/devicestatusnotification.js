import pluralize from 'pluralize';
import React from 'react';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import theme, { colors } from '../../themes/mender-theme';

const stateActionMap = {
  [DEVICE_STATES.pending]: 'pending authorization',
  [DEVICE_STATES.rejected]: 'reject',
  [DEVICE_STATES.preauth]: 'preauthorized',
  [DEVICE_STATES.accepted]: 'accepted'
};

export const DeviceStatusNotification = ({ deviceCount, onClick, state }) => {
  const pluralized = pluralize('device', deviceCount);
  return (
    <div className="clickable margin-top-small onboard" onClick={() => onClick(state)} style={{ background: colors.accent2Color, padding: theme.spacing(1.5) }}>
      <span className="info">
        {deviceCount} {pluralized} {pluralize('is', deviceCount)} {stateActionMap[state]}
      </span>
      <b className="margin-left-small link link-color">View {pluralized}</b>
    </div>
  );
};

export default DeviceStatusNotification;
