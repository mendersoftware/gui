import React from 'react';

// material ui
import { Checkbox, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, IconButton } from '@material-ui/core';

import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@material-ui/icons';

import AppStore from '../../stores/app-store';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import ExpandedDevice from './expanded-device';

export default class DeviceListItem extends React.PureComponent {
  render() {
    const self = this;
    const { columnHeaders, device, expanded, onClick, onRowSelect, selectable, selected } = self.props;
    const globalSettings = AppStore.getGlobalSettings();
    const id_attribute =
      globalSettings && globalSettings.id_attribute && globalSettings.id_attribute !== 'Device ID'
        ? (device.identity_data || {})[globalSettings.id_attribute]
        : device.id;

    const columnWidth = `${(selectable ? 90 : 100) / columnHeaders.length}%`;
    return (
      <ExpansionPanel className="deviceListItem" square expanded={expanded} onChange={onClick}>
        <ExpansionPanelSummary style={{ padding: '0 12px' }}>
          {selectable ? <Checkbox checked={selected} onChange={onRowSelect} /> : null}
          <div style={Object.assign({ width: columnHeaders[0].width || columnWidth, padding: '0 24px' }, columnHeaders[0].style)}>{id_attribute}</div>
          {/* we'll skip the first column, since this is the id and that gets resolved differently in the lines above */}
          {columnHeaders.slice(1).map((item, index) => (
            <div
              key={`column-${index}`}
              style={Object.assign(
                { width: item.width || columnWidth, padding: '0 24px', overflow: 'hidden', wordBreak: 'break-all', maxHeight: 48 },
                item.style
              )}
            >
              {item.render(device)}
            </div>
          ))}
          <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded ? (
            <ExpandedDevice
              {...self.props}
              className="expandedDevice"
              id_attribute={(globalSettings || {}).id_attribute}
              id_value={id_attribute}
              device={device}
              attrs={device.attributes}
              unauthorized={device.status !== DEVICE_STATES.accepted}
              device_type={device.attributes ? device.attributes.device_type : null}
            />
          ) : (
            <div />
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
