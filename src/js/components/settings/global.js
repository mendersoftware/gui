import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select } from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { getDeviceAttributes } from '../../actions/deviceActions';
import { changeNotificationSetting } from '../../actions/monitorActions';
import { getGlobalSettings, saveGlobalSettings } from '../../actions/userActions';
import { alertChannels } from '../../constants/monitorConstants';
import { getDocsVersion, getIdAttribute, getUserRoles, getTenantCapabilities } from '../../selectors';

const maxWidth = 750;

export const IdAttributeSelection = ({ attributes, dialog, docsVersion, onCloseClick, onSaveClick, selectedAttribute = '' }) => {
  const [attributeSelection, setAttributeSelection] = useState('name');

  useEffect(() => {
    setAttributeSelection(selectedAttribute);
  }, [selectedAttribute]);

  const changed = selectedAttribute !== attributeSelection;

  const onChangeIdAttribute = ({ target: { value } }) => setAttributeSelection(value);

  const undoChanges = e => {
    setAttributeSelection(selectedAttribute);
    if (dialog) {
      onCloseClick(e);
    }
  };

  const saveSettings = e => onSaveClick(e, { attribute: attributeSelection, scope: attributes.find(({ value }) => value === attributeSelection).scope });

  return (
    <div className="flexbox space-between" style={{ alignItems: 'flex-start', maxWidth }}>
      <FormControl>
        <InputLabel shrink id="device-id">
          Device identity attribute
        </InputLabel>
        <Select value={attributeSelection} onChange={onChangeIdAttribute}>
          {attributes.map(item => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText className="info" component="div">
          <div className="margin-top-small margin-bottom-small">Choose a device identity attribute to use to identify your devices throughout the UI.</div>
          <div className="margin-top-small margin-bottom-small">
            <a href={`https://docs.mender.io/${docsVersion}client-installation/identity`} target="_blank" rel="noopener noreferrer">
              Learn how to add custom identity attributes
            </a>{' '}
            to your devices.
          </div>
        </FormHelperText>
      </FormControl>
      <div className="margin-left margin-top flexbox">
        <Button disabled={!changed && !dialog} onClick={undoChanges} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={saveSettings} disabled={!changed} color="primary">
          Save
        </Button>
      </div>
    </div>
  );
};

export const GlobalSettingsDialog = ({
  attributes,
  docsVersion,
  hasMonitor,
  isAdmin,
  notificationChannelSettings,
  onChangeNotificationSetting,
  onCloseClick,
  onSaveClick,
  selectedAttribute
}) => {
  const [channelSettings, setChannelSettings] = useState(notificationChannelSettings);

  useEffect(() => {
    setChannelSettings(notificationChannelSettings);
  }, [notificationChannelSettings]);

  const onNotificationSettingsClick = ({ target: { checked } }, channel) => {
    setChannelSettings({ ...channelSettings, channel: { enabled: !checked } });
    onChangeNotificationSetting(!checked, channel);
  };

  return (
    <div style={{ maxWidth }} className="margin-top-small">
      <h2 className="margin-top-small">Global settings</h2>
      <p className="info" style={{ marginBottom: 30 }}>
        <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
        These settings apply to all users, so changes made here may affect other users&apos; experience.
      </p>
      <IdAttributeSelection
        attributes={attributes}
        docsVersion={docsVersion}
        onCloseClick={onCloseClick}
        onSaveClick={onSaveClick}
        selectedAttribute={selectedAttribute}
      />
      {isAdmin &&
        hasMonitor &&
        Object.keys(alertChannels).map(channel => (
          <FormControl key={channel}>
            <InputLabel className="capitalized-start" shrink id={`${channel}-notifications`}>
              {channel} notifications
            </InputLabel>
            <FormControlLabel
              control={<Checkbox checked={!channelSettings[channel].enabled} onChange={e => onNotificationSettingsClick(e, channel)} />}
              label={`Mute ${channel} notifications`}
            />
            <FormHelperText className="info" component="div">
              Mute {channel} notifications for deployment and monitoring issues for all users
            </FormHelperText>
          </FormControl>
        ))}
    </div>
  );
};

export const GlobalSettingsContainer = ({
  attributes,
  changeNotificationSetting,
  closeDialog,
  dialog,
  docsVersion,
  getDeviceAttributes,
  getGlobalSettings,
  hasMonitor,
  isAdmin,
  notificationChannelSettings,
  saveGlobalSettings,
  selectedAttribute,
  settings
}) => {
  const [updatedSettings, setUpdatedSettings] = useState({ ...settings });

  useEffect(() => {
    if (!settings) {
      getGlobalSettings();
    }
    getDeviceAttributes();
  }, []);

  useEffect(() => {
    setUpdatedSettings({ ...updatedSettings, ...settings });
  }, [settings]);

  const onCloseClick = e => {
    if (dialog) {
      return closeDialog(e);
    }
  };

  const saveAttributeSetting = (e, id_attribute) => {
    return saveGlobalSettings({ ...updatedSettings, id_attribute }, false, true).then(() => {
      if (dialog) {
        closeDialog(e);
      }
    });
  };

  if (dialog) {
    return (
      <IdAttributeSelection
        attributes={attributes}
        dialog
        docsVersion={docsVersion}
        onCloseClick={onCloseClick}
        onSaveClick={saveAttributeSetting}
        selectedAttribute={selectedAttribute}
      />
    );
  }
  return (
    <GlobalSettingsDialog
      attributes={attributes}
      docsVersion={docsVersion}
      hasMonitor={hasMonitor}
      isAdmin={isAdmin}
      notificationChannelSettings={notificationChannelSettings}
      onChangeNotificationSetting={changeNotificationSetting}
      onCloseClick={onCloseClick}
      onSaveClick={saveAttributeSetting}
      selectedAttribute={selectedAttribute}
    />
  );
};

const actionCreators = { changeNotificationSetting, getDeviceAttributes, getGlobalSettings, saveGlobalSettings };

const mapStateToProps = state => {
  const attributes = state.devices.filteringAttributes.identityAttributes.slice(0, state.devices.filteringAttributesLimit);
  const id_attributes = attributes.reduce(
    (accu, value) => {
      accu.push({ value, label: value, scope: 'identity' });
      return accu;
    },
    [
      { value: 'name', label: 'Name', scope: 'tags' },
      { value: 'id', label: 'Device ID', scope: 'identity' }
    ]
  );
  return {
    // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
    attributes: id_attributes,
    hasMonitor: getTenantCapabilities(state).hasMonitor,
    isAdmin: getUserRoles(state).isAdmin,
    devicesCount: Object.keys(state.devices.byId).length,
    docsVersion: getDocsVersion(state),
    notificationChannelSettings: state.monitor.settings.global.channels,
    selectedAttribute: getIdAttribute(state).attribute,
    settings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(GlobalSettingsContainer);
