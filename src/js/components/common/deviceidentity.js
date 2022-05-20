import React from 'react';
import { getDeviceIdentityText } from '../devices/base-devices';

import DeviceNameInput from './devicenameinput';

const DeviceIdComponent = ({ style = {}, value }) => <div style={style}>{value}</div>;

const attributeComponentMap = {
  default: DeviceIdComponent,
  name: DeviceNameInput
};

export const DeviceIdentityDisplay = props => {
  const { device, idAttribute, isEditable = true } = props;
  const idValue = getDeviceIdentityText({ device, idAttribute });
  const Component = !isEditable ? attributeComponentMap.default : attributeComponentMap[idAttribute] ?? attributeComponentMap.default;
  return <Component {...props} value={idValue} />;
};

export default DeviceIdentityDisplay;
