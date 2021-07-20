import React, { useState } from 'react';

// material ui
import { Checkbox } from '@material-ui/core';
import DeviceIdentityDisplay from '../common/deviceidentity';

const DeviceListItem = ({ columnHeaders, device, itemClassName = '', onClick, onRowSelect, selectable, selected }) => {
  const [isHovering, setIsHovering] = useState(false);

  const onMouseOut = () => setIsHovering(false);
  const onMouseOver = () => setIsHovering(true);

  return (
    <div
      className={`${itemClassName} deviceListItem clickable`}
      style={{ alignItems: 'center' }}
      onClick={onClick}
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseOut}
    >
      {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
      <DeviceIdentityDisplay device={device} isHovered={isHovering} style={columnHeaders[0].style} />
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
