import React from 'react';

// material ui
import { Checkbox, Accordion, AccordionDetails, AccordionSummary, IconButton } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@material-ui/icons';

import { DEVICE_STATES } from '../../constants/deviceConstants';
import ExpandedDevice from './expanded-device';

const defaultColumnStyle = {
  padding: '0 24px',
  overflow: 'hidden',
  wordBreak: 'break-all',
  maxHeight: 48,
  textOverflow: 'ellipsis'
};

const DeviceListItem = props => {
  const { columnHeaders, device, expandable = true, expanded, idAttribute, onClick, onRowSelect, selectable, selected } = props;
  const idValue = idAttribute !== 'Device ID' ? (device.identity_data || {})[idAttribute] : device.id;
  const columnWidth = `${(selectable ? 90 : 100) / columnHeaders.length}%`;
  return expandable ? (
    <Accordion className="deviceListItem" square expanded={expanded} onChange={onClick}>
      <AccordionSummary style={{ padding: '0 12px' }}>
        {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
        <div style={{ ...defaultColumnStyle, width: columnHeaders[0].width || columnWidth, ...columnHeaders[0].style }}>{idValue}</div>
        {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
        {columnHeaders.slice(1).map((item, index) => (
          <div key={`column-${index}`} style={{ ...defaultColumnStyle, width: item.width || columnWidth, ...item.style }}>
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
    <div className="deviceListItem flexbox" style={{ padding: '0px 12px', alignItems: 'center' }}>
      {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
      <div style={Object.assign({ width: columnHeaders[0].width || columnWidth, padding: '0 24px' }, columnHeaders[0].style)}>{idAttribute}</div>
      {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
      {columnHeaders.slice(1).map((item, index) => (
        <div
          key={`column-${index}`}
          style={Object.assign({ width: item.width || columnWidth, padding: '0 24px', overflow: 'hidden', wordBreak: 'break-all', maxHeight: 48 }, item.style)}
        >
          {item.render(device)}
        </div>
      ))}
    </div>
  );
};

export default DeviceListItem;
