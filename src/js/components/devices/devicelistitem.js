import React from 'react';
import Time from 'react-time';

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
import { colors } from '../../themes/mender-theme';

export default class DeviceListItem extends React.PureComponent {
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
    const { columnWidth, device, expanded, group, groups, pause, artifacts, redirect, selected, onClick, onSelect } = this.props;

    const globalSettings = AppStore.getGlobalSettings();
    const docsVersion = AppStore.getDocsVersion();
    const showHelptips = AppStore.showHelptips();

    const columnStyle = { width: columnWidth };

    var attrs = {
      device_type: '',
      artifact_name: ''
    };

    if (expanded && !self.state.expandedDevice) {
      self.getDeviceDetails(device);
    }

    var attributesLength = device.attributes ? device.attributes.length : 0;
    for (var i = 0; i < attributesLength; i++) {
      attrs[device.attributes[i].name] = device.attributes[i].value;
    }
    const id_attribute =
      globalSettings && globalSettings.id_attribute && globalSettings.id_attribute !== 'Device ID'
        ? (device.identity_data || {})[globalSettings.id_attribute]
        : device.id;
    return (
      <ExpansionPanel className="deviceListItem" square expanded={expanded} onChange={onClick} style={{ borderTop: `1px solid ${colors.borderColor}` }}>
        <ExpansionPanelSummary style={{ padding: '0 12px' }}>
          <Checkbox checked={selected} onChange={onSelect} style={{ marginRight: 12 }} />
          <div style={columnStyle}>{id_attribute}</div>
          <div style={columnStyle}>{attrs.device_type || '-'}</div>
          <div style={columnStyle}>{attrs.artifact_name || '-'}</div>
          <div style={columnStyle}>{device.updated_ts ? <Time value={device.updated_ts} format="YYYY-MM-DD HH:mm" /> : '-'}</div>
          <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded ? (
            <ExpandedDevice
              className="expandedDevice"
              id_attribute={(globalSettings || {}).id_attribute}
              id_value={id_attribute}
              docsVersion={docsVersion}
              showHelpTips={showHelptips}
              device={self.state.expandedDevice || device}
              attrs={device.attributes}
              device_type={attrs.device_type}
              redirect={redirect}
              artifacts={artifacts}
              selectedGroup={group}
              groups={groups}
              pause={pause}
            />
          ) : (
            <div />
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
