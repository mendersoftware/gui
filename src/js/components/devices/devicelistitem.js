import React from 'react';

// material ui
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import ExpandedDevice from './expanded-device';

export default class DeviceListItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expandedDevice: null
    };
  }

  /*
   * Get full device identity details for single selected device
   */
  getDeviceDetails(device) {
    var self = this;
    return AppActions.getDeviceAuth(device.id)
      .then(data =>
        self.setState({
          expandedDevice: {
            identity_data: data.identity_data,
            created_ts: data.created_ts,
            status: data.status,
            ...device
          }
        })
      )
      .catch(err => console.log(`Error: ${err}`));
  }

  render() {
    const self = this;
    const { columnHeaders, device, expanded, onClick, onRowSelect, selectable, selected } = self.props;

    const globalSettings = AppStore.getGlobalSettings();

    if (expanded && !self.state.expandedDevice) {
      self.getDeviceDetails(device);
    }

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
              style={Object.assign({ width: item.width || columnWidth, padding: '0 24px', overflow: 'hidden', maxHeight: 48 }, item.style)}
            >
              {item.render(device)}
            </div>
          ))}
          <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded && self.state.expandedDevice && self.state.expandedDevice.id === device.id ? (
            <ExpandedDevice
              {...self.props}
              className="expandedDevice"
              id_attribute={(globalSettings || {}).id_attribute}
              id_value={id_attribute}
              device={self.state.expandedDevice || device}
              attrs={device.attributes}
              unauthorized={device.status !== 'accepted'}
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
