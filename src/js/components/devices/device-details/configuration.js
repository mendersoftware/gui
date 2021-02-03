import React, { Fragment, useEffect, useState } from 'react';
import Time from 'react-time';

import { Button, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon
} from '@material-ui/icons';

import { deepCompare, isEmpty } from '../../../helpers';
import Confirm from '../../common/confirm';
import LogDialog from '../../common/dialogs/log';
import KeyValueEditor from '../../common/forms/keyvalueeditor';
import Loader from '../../common/loader';
import ConfigImportDialog from './configimportdialog';

const buttonStyle = { marginLeft: 30 };
const iconStyle = { margin: 12 };
const textStyle = { textTransform: 'capitalize', textAlign: 'left' };

const defaultReportTimeStamp = '0001-01-01T00:00:00Z';

export const ConfigUpToDateNote = ({ updated_ts = defaultReportTimeStamp }) => (
  <div className="flexbox margin-small">
    <CheckCircleIcon className="green" style={iconStyle} />
    <div>
      <Typography variant="subtitle2" style={textStyle}>
        Configuration up-to-date on the device
      </Typography>
      <Typography variant="caption" className="text-muted" style={textStyle}>
        Updated: {<Time value={updated_ts} format="YYYY-MM-DD HH:mm" />}
      </Typography>
    </div>
  </div>
);

export const ConfigEmptyNote = ({ updated_ts = '' }) => (
  <div className="flexbox column margin-small">
    <Typography variant="subtitle2">The device appears to either have an empty configuration or not to have reported a configuration yet.</Typography>
    <Typography variant="caption" className="text-muted" style={textStyle}>
      Updated: {<Time value={updated_ts} format="YYYY-MM-DD HH:mm" />}
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
      <div className="text-muted">You can import these key value pairs when configuring other devices</div>
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

export const ConfigUpdateNote = ({ isUpdatingConfig }) => (
  <div>
    <Typography variant="subtitle2" style={textStyle}>
      {isUpdatingConfig ? 'Updating configuration on device...' : 'Configuration could not be updated on device'}
    </Typography>
    <Typography variant="caption" className="text-muted" style={textStyle}>
      Status: {isUpdatingConfig ? 'pending' : 'failed'}
    </Typography>
  </div>
);

export const ConfigUpdateFailureActions = ({ onSubmit, onCancel }) => (
  <>
    {/*
    TODO: reintroduce log viewer functionality once backend support to retrieve config deployment exists
    <Button color="secondary" onClick={setShowLog} style={buttonStyle}>
      View log
    </Button>
    */}
    <Button color="secondary" onClick={onSubmit} startIcon={<RefreshIcon fontSize="small" />} style={buttonStyle}>
      Retry
    </Button>
    <a className="margin-left-large" onClick={onCancel}>
      cancel changes
    </a>
  </>
);

export const DeviceConfiguration = ({ device, defaultConfig = {}, submitConfig }) => {
  const { config = {} } = device;
  const { reported = {}, reported_ts } = config;

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
    setShouldUpdateEditor(!shouldUpdateEditor);
  }, [isEditingConfig, isUpdatingConfig]);

  useEffect(() => {
    if (device.config || changedConfig) {
      setIsEditDisabled(isUpdatingConfig);
      setIsEditingConfig(isUpdatingConfig || updateFailed);
    }
  }, [isUpdatingConfig, updateFailed]);

  useEffect(() => {
    const { config = {} } = device;
    const { configured = {}, reported = {}, updated_ts, reported_ts = defaultReportTimeStamp } = config;
    const hasConfig = device.config && (reported_ts !== defaultReportTimeStamp || !isEmpty(configured));
    const updateRunning = hasConfig && !deepCompare(configured, reported) && updated_ts > reported_ts;
    const newConfig = updateRunning ? configured : reported;
    if (!changedConfig) {
      setIsEditingConfig(!device.config);
      if (device.config) {
        setChangedConfig(newConfig);
        setIsUpdatingConfig(Boolean(updateRunning));
      }
    } else if ((!isEditingConfig && !deepCompare(newConfig, changedConfig)) || (isUpdatingConfig && !updateRunning)) {
      setChangedConfig(newConfig);
      setIsUpdatingConfig(Boolean(updateRunning));
    }
  }, [device.config]);

  const onConfigImport = ({ config, importType }) => {
    let updatedConfig = config;
    if (importType === 'default') {
      updatedConfig = defaultConfig;
    }
    setShouldUpdateEditor(!shouldUpdateEditor);
    setChangedConfig(updatedConfig);
    setShowConfigImport(false);
  };

  const onSetAsDefaultChange = () => {
    setIsSetAsDefault(!isSetAsDefault);
  };

  const onCancel = () => {
    setIsEditingConfig(isEmpty(reported));
    setChangedConfig(reported);
    const request = deepCompare(reported, changedConfig) ? Promise.resolve() : submitConfig({ config: reported });
    request.then(() => {
      setIsUpdatingConfig(false);
      setUpdateFailed(false);
      setIsAborting(false);
    });
  };

  const onSubmit = () => {
    setIsUpdatingConfig(true);
    setUpdateFailed(false);
    submitConfig({ config: changedConfig, isDefault: isSetAsDefault })
      .then(() => {
        setUpdateFailed(false);
      })
      .catch(({ log = 'something something loggy' }) => {
        setIsEditDisabled(false);
        setIsEditingConfig(true);
        setUpdateFailed(true);
        setIsUpdatingConfig(false);
        setUpdateLog(log);
      });
  };

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
    footer = (
      <>
        <div className="flexbox">
          {isUpdatingConfig && <Loader show={true} style={{ marginRight: 15, marginTop: -15 }} />}
          {updateFailed && <ErrorIcon className="red" style={iconStyle} />}
          <ConfigUpdateNote isUpdatingConfig={isUpdatingConfig} />
        </div>
        {updateFailed ? (
          <ConfigUpdateFailureActions setShowLog={setShowLog} onSubmit={onSubmit} onCancel={onCancel} />
        ) : isAborting ? (
          <Confirm cancel={() => setIsAborting(!isAborting)} action={onCancel} type="abort" classes="margin-left-large" />
        ) : (
          <Button color="secondary" onClick={() => setIsAborting(!isAborting)} startIcon={<BlockIcon fontSize="small" />} style={buttonStyle}>
            Abort update
          </Button>
        )}
      </>
    );
  }

  return (
    <div className="bordered margin-bottom-small">
      <div className="two-columns">
        <div className="flexbox" style={{ alignItems: 'baseline' }}>
          <h4 className="margin-bottom-none margin-right">Device configuration</h4>
          {!(isEditingConfig || isUpdatingConfig) && (
            <Button onClick={setIsEditingConfig} startIcon={<EditIcon />} size="small">
              Edit
            </Button>
          )}
        </div>
        {isEditingConfig && (
          <Button onClick={setShowConfigImport} startIcon={<SaveAltIcon />} style={{ justifySelf: 'left' }}>
            Import configuration
          </Button>
        )}
      </div>
      {isEditingConfig ? (
        <KeyValueEditor disabled={isEditDisabled} errortext={''} input={changedConfig} onInputChange={setChangedConfig} reset={shouldUpdateEditor} />
      ) : (
        hasDeviceConfig && (
          <div className="margin-top text-muted two-columns" style={{ maxWidth: 280, rowGap: 15 }}>
            {Object.entries(reported).map(([key, value]) => (
              <Fragment key={key}>
                <div className="align-right">
                  <b>{key}</b>
                </div>
                <div>{`${value}`}</div>
              </Fragment>
            ))}
          </div>
        )
      )}
      <div className="flexbox margin-bottom margin-top" style={{ alignItems: 'center' }}>
        {footer}
      </div>
      {showLog && <LogDialog logData={updateLog} onClose={() => setShowLog(false)} type="configUpdateLog" />}
      {showConfigImport && <ConfigImportDialog onCancel={() => setShowConfigImport(false)} onSubmit={onConfigImport} />}
    </div>
  );
};

export default DeviceConfiguration;
