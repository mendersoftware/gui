import React, { Fragment, useState } from 'react';
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

import Confirm from '../../common/confirm';
import LogDialog from '../../common/dialogs/log';
import KeyValueEditor from '../../common/forms/keyvalueeditor';
import Loader from '../../common/loader';
import ConfigImportDialog from './configimportdialog';

const buttonStyle = { marginLeft: 30 };
const iconStyle = { margin: 12 };
const textStyle = { textTransform: 'capitalize', textAlign: 'left' };

export const ConfigUpToDateNote = ({ updated_ts }) => (
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

export const ConfigEditingActions = ({ isSetAsDefault, onSetAsDefaultChange, onSubmit, onCancel }) => (
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
    <Button onClick={onCancel} style={buttonStyle}>
      Cancel changes
    </Button>
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

export const ConfigUpdateFailureActions = ({ setShowLog, onSubmit, onCancel }) => (
  <>
    <Button color="secondary" onClick={setShowLog} style={buttonStyle}>
      View log
    </Button>
    <Button color="secondary" onClick={onSubmit} startIcon={<RefreshIcon fontSize="small" />} style={buttonStyle}>
      Retry
    </Button>
    <a className="margin-left-large" onClick={onCancel}>
      cancel changes
    </a>
  </>
);

export const DeviceConfiguration = ({ device, defaultConfig = {}, submitConfig }) => {
  const { config = {}, updated_ts } = device;

  const [changedConfig, setChangedConfig] = useState(config);
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
    setIsAborting(false);
    setIsEditingConfig(false);
    setIsUpdatingConfig(false);
    setUpdateFailed(false);
    setIsEditDisabled(false);
    setChangedConfig(config);
  };

  const onSubmit = () => {
    setIsEditDisabled(true);
    setIsUpdatingConfig(true);
    setUpdateFailed(false);
    submitConfig({ config: changedConfig, isDefault: isSetAsDefault })
      .then(() => {
        setIsEditingConfig(false);
        setUpdateFailed(false);
      })
      .catch(({ log = 'something something loggy' }) => {
        setIsEditingConfig(true);
        setUpdateFailed(true);
        setUpdateLog(log);
      })
      .finally(() => {
        setIsUpdatingConfig(false);
        setIsEditDisabled(false);
      });
  };

  let footer = <ConfigUpToDateNote updated_ts={updated_ts} />;
  if (isEditingConfig) {
    footer = <ConfigEditingActions isSetAsDefault={isSetAsDefault} onSetAsDefaultChange={onSetAsDefaultChange} onSubmit={onSubmit} onCancel={onCancel} />;
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
          {!isEditingConfig && (
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
        <div className="margin-top text-muted two-columns" style={{ maxWidth: 280, rowGap: 15 }}>
          {Object.entries(config).map(([key, value]) => (
            <Fragment key={key}>
              <div className="align-right">
                <b>{key}</b>
              </div>
              <div>{`${value}`}</div>
            </Fragment>
          ))}
        </div>
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
