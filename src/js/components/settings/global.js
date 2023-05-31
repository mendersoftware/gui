// Copyright 2018 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { getDeviceAttributes } from '../../actions/deviceActions';
import { changeNotificationSetting } from '../../actions/monitorActions';
import { getGlobalSettings, saveGlobalSettings } from '../../actions/userActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { offlineThresholds } from '../../constants/deviceConstants';
import { alertChannels } from '../../constants/monitorConstants';
import { settingsKeys } from '../../constants/userConstants';
import { getDocsVersion, getIdAttribute, getOfflineThresholdSettings, getTenantCapabilities, getUserCapabilities, getUserRoles } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import InfoHint from '../common/info-hint';
import ArtifactGenerationSettings from './artifactgeneration';
import ReportingLimits from './reportinglimits';

const maxWidth = 750;

const useStyles = makeStyles()(theme => ({
  threshold: {
    display: 'grid',
    gridTemplateColumns: '100px 100px',
    columnGap: theme.spacing(2)
  },
  textInput: {
    marginTop: 0,
    minWidth: 'initial'
  }
}));

export const IdAttributeSelection = ({ attributes, dialog, docsVersion, onCloseClick, onSaveClick, selectedAttribute = '' }) => {
  const [attributeSelection, setAttributeSelection] = useState('name');

  useEffect(() => {
    setAttributeSelection(selectedAttribute);
  }, [selectedAttribute]);

  const changed = selectedAttribute !== attributeSelection;

  const onChangeIdAttribute = ({ target: { value: attributeSelection } }) => {
    setAttributeSelection(attributeSelection);
    if (dialog) {
      return;
    }
    onSaveClick(undefined, { attribute: attributeSelection, scope: attributes.find(({ value }) => value === attributeSelection).scope });
  };

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
      {dialog && (
        <div className="margin-left margin-top flexbox">
          <Button onClick={undoChanges} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveSettings} disabled={!changed} color="primary">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export const GlobalSettingsDialog = ({
  attributes,
  docsVersion,
  hasReporting,
  isAdmin,
  notificationChannelSettings,
  offlineThresholdSettings,
  onChangeNotificationSetting,
  onCloseClick,
  onSaveClick,
  saveGlobalSettings,
  selectedAttribute,
  settings,
  tenantCapabilities,
  userCapabilities
}) => {
  const [channelSettings, setChannelSettings] = useState(notificationChannelSettings);
  const [currentInterval, setCurrentInterval] = useState(offlineThresholdSettings.interval);
  const [currentIntervalUnit, setCurrentIntervalUnit] = useState(offlineThresholdSettings.intervalUnit);
  const [intervalErrorText, setIntervalErrorText] = useState('');
  const debouncedInterval = useDebounce(currentInterval, TIMEOUTS.debounceShort);
  const debouncedIntervalUnit = useDebounce(currentIntervalUnit, TIMEOUTS.debounceShort);
  const timer = useRef(false);
  const { classes } = useStyles();
  const { needsDeploymentConfirmation = false } = settings;
  const { canDelta, hasMonitor } = tenantCapabilities;
  const { canManageReleases } = userCapabilities;

  useEffect(() => {
    setChannelSettings(notificationChannelSettings);
  }, [notificationChannelSettings]);

  useEffect(() => {
    setCurrentInterval(offlineThresholdSettings.interval);
    setCurrentIntervalUnit(offlineThresholdSettings.intervalUnit);
  }, [offlineThresholdSettings.interval, offlineThresholdSettings.intervalUnit]);

  useEffect(() => {
    if (!window.sessionStorage.getItem(settingsKeys.initialized) || !timer.current) {
      return;
    }
    saveGlobalSettings({ offlineThreshold: { interval: debouncedInterval, intervalUnit: debouncedIntervalUnit } }, false, true);
  }, [debouncedInterval, debouncedIntervalUnit]);

  useEffect(() => {
    const initTimer = setTimeout(() => (timer.current = true), TIMEOUTS.threeSeconds);
    return () => {
      clearTimeout(initTimer);
    };
  }, []);

  const onNotificationSettingsClick = ({ target: { checked } }, channel) => {
    setChannelSettings({ ...channelSettings, channel: { enabled: !checked } });
    onChangeNotificationSetting(!checked, channel);
  };

  const onChangeOfflineIntervalUnit = ({ target: { value } }) => setCurrentIntervalUnit(value);
  const onChangeOfflineInterval = ({ target: { validity, value } }) => {
    if (validity.valid) {
      setCurrentInterval(value || 1);
      return setIntervalErrorText('');
    }
    setIntervalErrorText('Please enter a valid number between 1 and 1000.');
  };

  const toggleDeploymentConfirmation = () => {
    saveGlobalSettings({ needsDeploymentConfirmation: !needsDeploymentConfirmation });
  };

  return (
    <div style={{ maxWidth }} className="margin-top-small">
      <h2 className="margin-top-small">Global settings</h2>
      <InfoHint content="These settings apply to all users, so changes made here may affect other users' experience." style={{ marginBottom: 30 }} />
      <IdAttributeSelection
        attributes={attributes}
        docsVersion={docsVersion}
        onCloseClick={onCloseClick}
        onSaveClick={onSaveClick}
        selectedAttribute={selectedAttribute}
      />
      {hasReporting && <ReportingLimits />}
      <InputLabel className="margin-top" shrink>
        Deployments
      </InputLabel>
      <div className="clickable flexbox center-aligned" onClick={toggleDeploymentConfirmation}>
        <p className="help-content">Require confirmation on deployment creation</p>
        <Switch checked={needsDeploymentConfirmation} />
      </div>
      {canManageReleases && canDelta && <ArtifactGenerationSettings />}
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

      <InputLabel className="margin-top" shrink id="offline-theshold">
        Offline threshold
      </InputLabel>
      <div className={classes.threshold}>
        <Select onChange={onChangeOfflineIntervalUnit} value={currentIntervalUnit}>
          {offlineThresholds.map(value => (
            <MenuItem key={value} value={value}>
              <div className="capitalized-start">{value}</div>
            </MenuItem>
          ))}
        </Select>
        <TextField
          className={classes.textInput}
          type="number"
          onChange={onChangeOfflineInterval}
          inputProps={{ min: '1', max: '1000' }}
          error={!!intervalErrorText}
          value={currentInterval}
        />
      </div>
      {!!intervalErrorText && (
        <FormHelperText className="warning" component="div">
          {intervalErrorText}
        </FormHelperText>
      )}
      <FormHelperText className="info" component="div">
        Choose how long a device can go without reporting to the server before it is considered “offline”.
      </FormHelperText>
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
  hasReporting,
  isAdmin,
  notificationChannelSettings,
  offlineThresholdSettings,
  saveGlobalSettings,
  selectedAttribute,
  settings,
  tenantCapabilities,
  userCapabilities
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
  }, [JSON.stringify(settings)]);

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
      hasReporting={hasReporting}
      isAdmin={isAdmin}
      notificationChannelSettings={notificationChannelSettings}
      offlineThresholdSettings={offlineThresholdSettings}
      onChangeNotificationSetting={changeNotificationSetting}
      onCloseClick={onCloseClick}
      onSaveClick={saveAttributeSetting}
      saveGlobalSettings={saveGlobalSettings}
      settings={settings}
      selectedAttribute={selectedAttribute}
      tenantCapabilities={tenantCapabilities}
      userCapabilities={userCapabilities}
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
    hasReporting: state.app.features.hasReporting,
    isAdmin: getUserRoles(state).isAdmin,
    devicesCount: Object.keys(state.devices.byId).length,
    docsVersion: getDocsVersion(state),
    notificationChannelSettings: state.monitor.settings.global.channels,
    offlineThresholdSettings: getOfflineThresholdSettings(state),
    selectedAttribute: getIdAttribute(state).attribute,
    settings: state.users.globalSettings,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(GlobalSettingsContainer);
