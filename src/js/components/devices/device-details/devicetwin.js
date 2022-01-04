import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';

import { Button } from '@material-ui/core';
import { CheckCircleOutlined, CloudUploadOutlined as CloudUpload, Refresh as RefreshIcon } from '@material-ui/icons';

import Editor, { DiffEditor, loader } from '@monaco-editor/react';

import pluralize from 'pluralize';

import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import { deepCompare, isEmpty } from '../../../helpers';
import theme from '../../../themes/mender-theme';
import InfoHint from '../../common/info-hint';
import Loader from '../../common/loader';
import DeviceDataCollapse from './devicedatacollapse';

loader.config({ paths: { vs: '/ui/vs' } });

const diffStatusStyle = {
  minHeight: 75,
  display: 'grid',
  gridTemplateColumns: 'min-content 300px max-content',
  gridColumnGap: theme.spacing(2),
  alignItems: 'center',
  background: theme.palette.grey[100],
  width: 'min-content'
};

const LastSyncNote = ({ updateTime }) => (
  <div className="text-muted slightly-smaller" style={{ alignContent: 'flex-end', marginBottom: -10 }}>
    Last synced: <Time value={updateTime} format="YYYY-MM-DD HH:mm" />
  </div>
);

const NoDiffStatus = ({ updateTime }) => (
  <div className="padding" style={diffStatusStyle}>
    <CheckCircleOutlined className="green" />
    <div>No difference between desired and reported configuration</div>
    <LastSyncNote updateTime={updateTime} />
  </div>
);

export const TwinError = ({ providerTitle, twinError }) => (
  <InfoHint
    content={
      <>
        {twinError}
        <br />
        Please check your connection string in the <Link to="/settings/integrations">Integration settings</Link>, and check that the device exists in your{' '}
        {providerTitle}
      </>
    }
  />
);

export const TwinSyncStatus = ({ diffCount, providerTitle, twinError, updateTime }) => {
  if (twinError) {
    return <TwinError providerTitle={providerTitle} twinError={twinError} />;
  }
  return !diffCount ? (
    <NoDiffStatus updateTime={updateTime} />
  ) : (
    <div className="padding" style={diffStatusStyle}>
      <CloudUpload />
      <div>
        <b>
          Found {diffCount} {pluralize('difference', diffCount)}
        </b>{' '}
        between desired and reported configuration
      </div>
      <LastSyncNote updateTime={updateTime} />
    </div>
  );
};

export const Title = ({ providerTitle }) => (
  <div className="flexbox center-aligned">
    <h4 className="margin-right">{providerTitle} Device Twin</h4>
    <Link to="/settings/integrations">Integration settings</Link>
  </div>
);

const editorProps = {
  height: 500,
  defaultLanguage: 'json',
  language: 'json',
  loading: <Loader show />,
  options: {
    autoClosingOvertype: 'auto',
    codeLens: false,
    contextmenu: false,
    enableSplitViewResizing: false,
    formatOnPaste: true,
    lightbulb: { enabled: false },
    minimap: { enabled: false },
    lineNumbersMinChars: 3,
    quickSuggestions: false,
    renderOverviewRuler: false,
    scrollBeyondLastLine: false,
    readOnly: true
  }
};
const maxWidth = 800;

const externalProvider = EXTERNAL_PROVIDER['iot-hub'];
const indentation = 4; // number of spaces, tab based indentation won't show in the editor, but be converted to 4 spaces

export const DeviceTwin = ({ device, getDeviceTwin, integrations, setDeviceTwin }) => {
  const [configured, setConfigured] = useState('');
  const [diffCount, setDiffCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState('');
  const [updated, setUpdated] = useState('');
  const [isSync, setIsSync] = useState(true);
  const editorRef = useRef(null);

  const integration = integrations.find(integration => integration.provider === externalProvider.provider);

  const { [externalProvider.provider]: deviceTwin = {} } = device.twinsByProvider ?? {};
  const { desired: configuredTwin = {}, reported: reportedTwin = {}, twinError, updated_ts: updateTime = device.created_ts } = deviceTwin;

  useEffect(() => {
    const textContent = JSON.stringify(configuredTwin, undefined, indentation) ?? '';
    setConfigured(textContent);
    setUpdated(textContent);
    setReported(JSON.stringify(reportedTwin, undefined, indentation) ?? '');
    setIsEditing;
  }, [open]);

  useEffect(() => {
    setIsSync(deepCompare(reported, configured));
  }, [configured, reported]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = { editor, monaco, modifiedEditor: editor };
  };

  const handleDiffEditorDidMount = (editor, monaco) => {
    const modifiedEditor = editor.getModifiedEditor();
    modifiedEditor.onDidChangeModelContent(() => setUpdated(modifiedEditor.getValue()));
    editor.onDidUpdateDiff(onDidUpdateDiff);
    editorRef.current = { editor, monaco, modifiedEditor };
  };

  const onDidUpdateDiff = () => {
    const changes = editorRef.current.editor.getLineChanges();
    setDiffCount(changes.length);
    setInitialized(true);
  };

  const onApplyClick = () => {
    let update = {};
    try {
      update = JSON.parse(updated);
    } catch (error) {
      setErrorMessage('There was an error parsing the device twin changes, please ensure that it is valid JSON.');
      return;
    }
    editorRef.current.modifiedEditor.getAction('editor.action.formatDocument').run();
    setUpdated(JSON.stringify(update, undefined, 4));
    setErrorMessage('');
    setDeviceTwin(device.id, integration, update).then(() => setIsEditing(false));
  };

  const onCancelClick = () => {
    const textContent = JSON.stringify(configuredTwin, undefined, indentation) ?? '';
    setUpdated(textContent);
    editorRef.current.modifiedEditor.getModel().setValue(textContent);
    setIsEditing(false);
  };

  const onRefreshClick = () => {
    setIsRefreshing(true);
    getDeviceTwin(device.id, integration).finally(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  const onEditClick = () => setIsEditing(true);

  const onExpandClick = twinError ? undefined : () => setOpen(true);

  const widthStyle = { maxWidth: isSync ? maxWidth : 'initial' };

  return (
    <DeviceDataCollapse
      header={
        <div className="flexbox column">
          {initialized ? (
            <>
              <TwinSyncStatus diffCount={diffCount} providerTitle={externalProvider.title} twinError={twinError} updateTime={updateTime} />
              {!twinError && !open && (
                <a className="margin-top-small" onClick={setOpen}>
                  show more
                </a>
              )}
            </>
          ) : (
            <Loader show={!initialized} />
          )}
        </div>
      }
      isOpen={open}
      onClick={onExpandClick}
      shouldUnmount={false}
      title={<Title providerTitle={externalProvider.title} />}
    >
      <div className={`flexbox column ${isEditing ? 'twin-editing' : ''}`}>
        <div style={widthStyle}>
          {!initialized || (!(isEmpty(reported) && isEmpty(configured)) && !isSync) ? (
            <>
              <div className="two-columns">
                <h4>Desired configuration</h4>
                <h4>Reported configuration</h4>
              </div>
              <DiffEditor
                {...editorProps}
                original={reported}
                modified={configured}
                onMount={handleDiffEditorDidMount}
                options={{
                  ...editorProps.options,
                  readOnly: !isEditing
                }}
              />
            </>
          ) : (
            <>
              <h4>{!deviceTwin.reported || isEditing ? 'Desired' : 'Reported'} configuration</h4>
              <Editor
                {...editorProps}
                options={{
                  ...editorProps.options,
                  readOnly: !isEditing
                }}
                className="editor modified"
                onMount={handleEditorDidMount}
                value={reported || configured}
                onChange={setUpdated}
              />
            </>
          )}
          {!!errorMessage && <p className="warning">{errorMessage}</p>}
        </div>
        <div className="two-columns margin-top" style={isSync ? { gridTemplateColumns: `${maxWidth}px 1fr` } : widthStyle}>
          <div className="flexbox" style={{ alignItems: 'flex-start', justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button color="secondary" onClick={onApplyClick} style={{ marginLeft: theme.spacing(2) }} variant="contained">
                  Save
                </Button>
              </>
            ) : (
              <Button color="secondary" onClick={onEditClick} variant="contained">
                Edit desired configuration
              </Button>
            )}
          </div>
          <div className="flexbox" style={{ justifyContent: 'flex-end' }}>
            <Loader show={isRefreshing} small table />
            {!isEditing && (
              <Button onClick={onRefreshClick} startIcon={<RefreshIcon />}>
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>
    </DeviceDataCollapse>
  );
};

export default DeviceTwin;
