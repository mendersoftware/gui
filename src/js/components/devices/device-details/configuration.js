// Copyright 2021 Northern.tech AS
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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon
} from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel, Typography } from '@mui/material';

import { DEPLOYMENT_ROUTES } from '../../../constants/deploymentConstants';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { deepCompare, groupDeploymentDevicesStats, groupDeploymentStats, isEmpty, toggle } from '../../../helpers';
import Tracking from '../../../tracking';
import ConfigurationObject from '../../common/configurationobject';
import Confirm from '../../common/confirm';
import LogDialog from '../../common/dialogs/log';
import KeyValueEditor from '../../common/forms/keyvalueeditor';
import Loader from '../../common/loader';
import Time from '../../common/time';
import { ConfigureAddOnTip, ConfigureRaspberryLedTip, ConfigureTimezoneTip } from '../../helptips/helptooltips';
import ConfigImportDialog from './configimportdialog';
import DeviceDataCollapse from './devicedatacollapse';

const buttonStyle = { marginLeft: 30 };
const iconStyle = { margin: 12 };
const textStyle = { textTransform: 'capitalize', textAlign: 'left' };

const defaultReportTimeStamp = '0001-01-01T00:00:00Z';

const configHelpTipsMap = {
  'mender-demo-raspberrypi-led': {
    position: 'right',
    component: ConfigureRaspberryLedTip
  },
  timezone: {
    position: 'right',
    component: ConfigureTimezoneTip
  }
};

export const ConfigUpToDateNote = ({ updated_ts = defaultReportTimeStamp }) => (
  <div className="flexbox margin-small">
    <CheckCircleIcon className="green" style={iconStyle} />
    <div>
      <Typography variant="subtitle2" style={textStyle}>
        Configuration up-to-date on the device
      </Typography>
      <Typography variant="caption" className="muted" style={textStyle}>
        Updated: {<Time value={updated_ts} />}
      </Typography>
    </div>
  </div>
);

export const ConfigEmptyNote = ({ updated_ts = '' }) => (
  <div className="flexbox column margin-small">
    <Typography variant="subtitle2">The device appears to either have an empty configuration or not to have reported a configuration yet.</Typography>
    <Typography variant="caption" className="muted" style={textStyle}>
      Updated: {<Time value={updated_ts} />}
    </Typography>
  </div>
);

export const ConfigEditingActions = ({ hasDeviceConfig, isSetAsDefault, onSetAsDefaultChange, onSubmit, onCancel }) => (
  <>
    <div style={{ maxWidth: 275 }}>
      <FormControlLabel
        control={<Checkbox color="primary" checked={isSetAsDefault} onChange={onSetAsDefaultChange} size="small" />}
        label="Save as default configuration"
        style={{ marginTop: 0 }}
      />
      <div className="muted">You can import these key value pairs when configuring other devices</div>
    </div>
    <Button variant="contained" color="primary" onClick={onSubmit} style={buttonStyle}>
      Save and apply to device
    </Button>
    {hasDeviceConfig && (
      <Button onClick={onCancel} style={buttonStyle}>
        Cancel changes
      </Button>
    )}
  </>
);

export const ConfigUpdateNote = ({ isUpdatingConfig, isAccepted }) => (
  <div>
    <Typography variant="subtitle2" style={textStyle}>
      {!isAccepted
        ? 'Configuration will be applied once the device is connected'
        : isUpdatingConfig
        ? 'Updating configuration on device...'
        : 'Configuration could not be updated on device'}
    </Typography>
    <Typography variant="caption" className="muted" style={textStyle}>
      Status: {isUpdatingConfig || !isAccepted ? 'pending' : 'failed'}
    </Typography>
  </div>
);

export const ConfigUpdateFailureActions = ({ hasLog, onSubmit, onCancel, setShowLog }) => (
  <>
    {hasLog && (
      <Button color="secondary" onClick={setShowLog} style={buttonStyle}>
        View log
      </Button>
    )}
    <Button color="secondary" onClick={onSubmit} startIcon={<RefreshIcon fontSize="small" />} style={buttonStyle}>
      Retry
    </Button>
    <a className="margin-left-large" onClick={onCancel}>
      cancel changes
    </a>
  </>
);

export const DeviceConfiguration = ({
  abortDeployment,
  applyDeviceConfig,
  defaultConfig = {},
  device,
  deployment = {},
  getDeviceLog,
  getSingleDeployment,
  saveGlobalSettings,
  setDeviceConfig,
  setSnackbar,
  showHelptips
}) => {
  const { config = {}, status } = device;
  const { configured, deployment_id, reported = {}, reported_ts, updated_ts } = config;

  const [changedConfig, setChangedConfig] = useState();
  const [isEditDisabled, setIsEditDisabled] = useState(false);
  const [isAborting, setIsAborting] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isSetAsDefault, setIsSetAsDefault] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [shouldUpdateEditor, setShouldUpdateEditor] = useState(false);
  const [showConfigImport, setShowConfigImport] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [updateFailed, setUpdateFailed] = useState();
  const [updateLog, setUpdateLog] = useState();

  useEffect(() => {
    setShouldUpdateEditor(toggle);
  }, [isEditingConfig, isUpdatingConfig]);

  useEffect(() => {
    if (device.config || changedConfig) {
      setIsEditDisabled(isUpdatingConfig);
      setIsEditingConfig(isUpdatingConfig || updateFailed);
    }
  }, [isUpdatingConfig, updateFailed]);

  useEffect(() => {
    if (deployment.devices && deployment.devices[device.id]?.log) {
      setUpdateLog(deployment.devices[device.id].log);
    }
  }, [deployment.devices]);

  useEffect(() => {
    if (deployment.status === 'finished') {
      // we have to rely on the device stats here as the state change might not have propagated to the deployment status
      // leaving all stats at 0 and giving a false impression of deployment success
      const stats = groupDeploymentStats(deployment);
      const deviceStats = groupDeploymentDevicesStats(deployment);
      setUpdateFailed(deployment.created > updated_ts && deployment.finished > reported_ts && (stats.failures || deviceStats.failures));
      setIsUpdatingConfig(false);
    } else if (deployment.status) {
      setChangedConfig(configured);
      // we can't rely on the deployment.status to be !== 'finished' since `deployment` is initialized as an empty object
      // and thus the undefined status would also point to an ongoing update
      setIsUpdatingConfig(true);
    }
  }, [deployment.status]);

  useEffect(() => {
    const { config = {} } = device;
    if (!changedConfig && device.config && (!deployment_id || deployment.status)) {
      const { configured = {}, reported = {}, reported_ts } = config;
      let currentConfig = reported;
      const stats = groupDeploymentStats(deployment);
      if (deployment.status !== 'finished' || (deployment.finished > reported_ts && stats.failures)) {
        currentConfig = configured;
      }
      setChangedConfig(currentConfig);
    }
    if (deployment.status !== 'finished' && deployment_id) {
      getSingleDeployment(deployment_id);
    }
  }, [device.config, deployment.status]);

  const onConfigImport = ({ config, importType }) => {
    let updatedConfig = config;
    if (importType === 'default') {
      updatedConfig = defaultConfig.current;
    }
    setShouldUpdateEditor(toggle);
    setChangedConfig(updatedConfig);
    setShowConfigImport(false);
  };

  const onSetAsDefaultChange = () => setIsSetAsDefault(toggle);

  const onShowLog = () => {
    getDeviceLog(deployment_id, device.id).then(result => {
      setShowLog(true);
      setUpdateLog(result[1]);
    });
  };

  const onCancel = () => {
    setIsEditingConfig(isEmpty(reported));
    setChangedConfig(reported);
    let requests = [];
    if (deployment_id && deployment.status !== 'finished') {
      requests.push(abortDeployment(deployment_id));
    }
    if (deepCompare(reported, changedConfig)) {
      requests.push(Promise.resolve());
    } else {
      requests.push(setDeviceConfig(device.id, reported));
      if (isSetAsDefault) {
        requests.push(saveGlobalSettings({ defaultDeviceConfig: { current: defaultConfig.previous } }));
      }
    }
    return Promise.all(requests).then(() => {
      setIsUpdatingConfig(false);
      setUpdateFailed(false);
      setIsAborting(false);
    });
  };

  const onSubmit = () => {
    Tracking.event({ category: 'devices', action: 'apply_configuration' });
    setIsUpdatingConfig(true);
    setUpdateFailed(false);
    return setDeviceConfig(device.id, changedConfig)
      .then(() => applyDeviceConfig(device.id, { retries: 0 }, isSetAsDefault, changedConfig))
      .then(() => {
        setUpdateFailed(false);
      })
      .catch(() => {
        setIsEditDisabled(false);
        setIsEditingConfig(true);
        setUpdateFailed(true);
        setIsUpdatingConfig(false);
      });
  };

  const onStartEdit = e => {
    e.stopPropagation();
    setChangedConfig(configured || reported);
    setIsEditingConfig(true);
  };

  const onStartImportClick = e => {
    e.stopPropagation();
    setShowConfigImport(true);
  };

  const onAbortClick = () => setIsAborting(toggle);

  const hasDeviceConfig = !isEmpty(reported);
  let footer = hasDeviceConfig ? <ConfigUpToDateNote updated_ts={reported_ts} /> : <ConfigEmptyNote updated_ts={device.updated_ts} />;
  if (isEditingConfig) {
    footer = (
      <ConfigEditingActions
        hasDeviceConfig={hasDeviceConfig}
        isSetAsDefault={isSetAsDefault}
        onSetAsDefaultChange={onSetAsDefaultChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  if (isUpdatingConfig || updateFailed) {
    const hasLog = deployment.devices && deployment.devices[device.id]?.log;
    footer = (
      <>
        <div className="flexbox">
          {isUpdatingConfig && <Loader show={true} style={{ marginRight: 15, marginTop: -15 }} />}
          {updateFailed && <ErrorIcon className="red" style={iconStyle} />}
          <ConfigUpdateNote isUpdatingConfig={isUpdatingConfig} isAccepted={status === DEVICE_STATES.accepted} />
        </div>
        {updateFailed ? (
          <ConfigUpdateFailureActions hasLog={hasLog} setShowLog={onShowLog} onSubmit={onSubmit} onCancel={onCancel} />
        ) : isAborting ? (
          <Confirm cancel={onAbortClick} action={onCancel} type="abort" classes="margin-left-large" />
        ) : (
          <>
            <Button color="secondary" onClick={onAbortClick} startIcon={<BlockIcon fontSize="small" />} style={buttonStyle}>
              Abort update
            </Button>
            <Button
              color="secondary"
              component={Link}
              to={`/deployments/${deployment.status || DEPLOYMENT_ROUTES.active.key}?open=true&id=${deployment_id}`}
              style={buttonStyle}
            >
              View deployment
            </Button>
          </>
        )}
      </>
    );
  }

  const helpTipsMap = Object.entries(configHelpTipsMap).reduce((accu, [key, value]) => {
    accu[key] = {
      ...value,
      props: { deviceId: device.id }
    };
    return accu;
  }, {});

  return (
    <DeviceDataCollapse
      isAddOn
      title={
        <div className="two-columns">
          <div className="flexbox center-aligned">
            <h4 className="margin-right">Device configuration</h4>
            {!(isEditingConfig || isUpdatingConfig) && (
              <Button onClick={onStartEdit} startIcon={<EditIcon />} size="small">
                Edit
              </Button>
            )}
          </div>
          {isEditingConfig ? (
            <Button onClick={onStartImportClick} disabled={isUpdatingConfig} startIcon={<SaveAltIcon />} style={{ justifySelf: 'left' }}>
              Import configuration
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="relative">
        {isEditingConfig ? (
          <KeyValueEditor
            disabled={isEditDisabled}
            errortext=""
            input={changedConfig}
            inputHelpTipsMap={helpTipsMap}
            onInputChange={setChangedConfig}
            reset={shouldUpdateEditor}
            showHelptips={showHelptips}
          />
        ) : (
          hasDeviceConfig && <ConfigurationObject config={reported} setSnackbar={setSnackbar} />
        )}
        {showHelptips && <ConfigureAddOnTip />}
        <div className="flexbox center-aligned margin-bottom margin-top">{footer}</div>
        {showLog && <LogDialog logData={updateLog} onClose={() => setShowLog(false)} type="configUpdateLog" />}
        {showConfigImport && <ConfigImportDialog onCancel={() => setShowConfigImport(false)} onSubmit={onConfigImport} setSnackbar={setSnackbar} />}
      </div>
    </DeviceDataCollapse>
  );
};

export default DeviceConfiguration;
