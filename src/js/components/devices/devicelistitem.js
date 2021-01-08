import React from 'react';

// material ui
import { Checkbox, Accordion, AccordionDetails, AccordionSummary, IconButton } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@material-ui/icons';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import ExpandedDevice from './expanded-device';

const DeviceListItem = props => {
  const { columnHeaders, device, expandable = true, expanded, idAttribute, itemClassName, onClick, onRowSelect, selectable, selected } = props;
  const idValue = idAttribute !== 'Device ID' ? (device.identity_data || {})[idAttribute] : device.id;
  return expandable ? (
    <Accordion className="deviceListItem" square expanded={expanded} onChange={onClick}>
      <AccordionSummary classes={{ content: itemClassName }} style={{ padding: 0 }}>
        {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
        <div style={columnHeaders[0].style}>{idValue}</div>
        {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
        {columnHeaders.slice(1).map((item, index) => (
          <div key={`column-${index}`} style={item.style}>
            {item.render(device)}
          </div>
        ))}
        <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
      </AccordionSummary>
      <AccordionDetails>
        {expanded ? (
          <ExpandedDevice
            {...props}
            className="expandedDevice"
            id_attribute={idAttribute}
            id_value={idValue}
            device={device}
            attrs={device.attributes}
            unauthorized={device.status !== DEVICE_STATES.accepted}
            device_type={device.attributes ? device.attributes.device_type : null}
          />
        ) : (
          <div />
        )}
      </AccordionDetails>
    </Accordion>
  ) : (
    <div className={`${itemClassName} deviceListItem `} style={{ padding: '0px 12px', alignItems: 'center' }}>
      {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
      <div style={{ ...columnHeaders[0].style, padding: '0 24px' }}>{idAttribute}</div>
      {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
      {columnHeaders.slice(1).map((item, index) => (
        <div key={`column-${index}`} style={{ ...item.style, padding: '0 24px' }}>
          {item.render(device)}
        </div>
      ))}
    </div>
  );
};

export default DeviceListItem;
