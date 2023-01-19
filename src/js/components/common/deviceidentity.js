import React, { useMemo } from 'react';

import { makeStyles } from 'tss-react/mui';

import GatewayConnectionIcon from '../../../assets/img/gateway-connection.svg';
import GatewayIcon from '../../../assets/img/gateway.svg';
import { stringToBoolean } from '../../helpers';
import { getDeviceIdentityText } from '../devices/base-devices';
import DeviceNameInput from './devicenameinput';

const useStyles = makeStyles()(theme => ({
  gatewayIcon: {
    color: theme.palette.grey[400],
    width: 'max-content',
    marginRight: theme.spacing()
  }
}));

const DeviceIdComponent = ({ style = {}, value }) => <div style={style}>{value}</div>;

const attributeComponentMap = {
  default: DeviceIdComponent,
  name: DeviceNameInput
};

const adornments = [
  {
    component: GatewayConnectionIcon,
    isApplicable: ({ attributes = {} }) => !stringToBoolean(attributes.mender_is_gateway) && attributes.mender_gateway_system_id !== ''
  },
  { component: GatewayIcon, isApplicable: ({ attributes = {} }) => stringToBoolean(attributes.mender_is_gateway) }
];

export const DeviceIdentityDisplay = props => {
  const { device, idAttribute, isEditable = true, hasAdornment = true } = props;
  const idValue = getDeviceIdentityText({ device, idAttribute });
  const { classes } = useStyles();

  const Component = !isEditable ? attributeComponentMap.default : attributeComponentMap[idAttribute] ?? attributeComponentMap.default;
  const { attributes = {} } = device;
  const EndAdornment = useMemo(
    () => adornments.find(item => item.isApplicable(device))?.component,
    [attributes.mender_is_gateway, attributes.mender_gateway_system_id]
  );
  return (
    <div className="flexbox space-between">
      <Component {...props} value={idValue} />
      {hasAdornment && EndAdornment && <EndAdornment className={`${classes.gatewayIcon}`} />}
    </div>
  );
};

export default DeviceIdentityDisplay;
