import React from 'react';

import DeviceNameInput from './devicenameinput';

const DeviceIdComponent = ({ style, value }) => <div style={style}>{value}</div>;

const attributeComponentMap = {
  default: DeviceIdComponent,
  name: DeviceNameInput
};

export const DeviceIdentityDisplay = props => {
  const { device, idAttribute, isEditable = true } = props;
  const { identity_data = {}, id } = device;
  // eslint-disable-next-line no-unused-vars
  const { status, ...remainingIds } = identity_data;
  const nonIdKey = Object.keys(remainingIds)[0];
  const idValue = !idAttribute || idAttribute === 'id' || idAttribute === 'Device ID' ? id : identity_data[idAttribute] ?? identity_data[nonIdKey];
  const Component = isEditable ? attributeComponentMap[idAttribute] ?? attributeComponentMap.default : attributeComponentMap.default;
  return <Component {...props} value={idValue} />;
};

export default DeviceIdentityDisplay;
