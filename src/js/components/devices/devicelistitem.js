import React from 'react';

// material ui
import { Checkbox } from '@material-ui/core';

const DeviceListItem = props => {
  const { columnHeaders, device, idAttribute, itemClassName = '', onClick, onRowSelect, selectable, selected } = props;
  const idValue = idAttribute !== 'Device ID' ? (device.identity_data || {})[idAttribute] : device.id;
  return (
    <div className={`${itemClassName} deviceListItem clickable`} style={{ alignItems: 'center' }} onClick={onClick}>
      {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
      <div style={columnHeaders[0].style}>{idValue}</div>
      {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
      {columnHeaders.slice(1).map((item, index) => (
        <div key={`column-${index}`} style={item.style}>
          {item.render(device)}
        </div>
      ))}
    </div>
  );
};

export default DeviceListItem;
