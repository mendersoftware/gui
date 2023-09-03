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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { mdiConsole as ConsoleIcon } from '@mdi/js';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { setSnackbar } from '../../../actions/appActions';
import { deviceFileUpload, getDeviceFileDownloadLink } from '../../../actions/deviceActions';
import { BEGINNING_OF_TIME, TIMEOUTS } from '../../../constants/appConstants';
import { createDownload } from '../../../helpers';
import { getFeatures, getIsEnterprise, getIsPreview, getTenantCapabilities, getUserCapabilities } from '../../../selectors';
import { useSession } from '../../../utils/sockethook';
import { TwoColumns } from '../../common/configurationobject';
import MaterialDesignIcon from '../../common/materialdesignicon';
import { MaybeTime } from '../../common/time';
import FileTransfer from '../troubleshoot/filetransfer';
import Terminal from '../troubleshoot/terminal';
import ListOptions from '../widgets/listoptions';
import DeviceIdentityDisplay from './../../common/deviceidentity';
import { getCode } from './make-gateway-dialog';

momentDurationFormatSetup(moment);

const useStyles = makeStyles()(theme => ({
  content: { padding: 0, margin: '0 24px', height: '75vh' },
  title: { marginRight: theme.spacing(0.5) },
  connectionButton: { background: theme.palette.text.primary },
  connectedIcon: { color: theme.palette.success.main, marginLeft: theme.spacing() },
  disconnectedIcon: { color: theme.palette.error.main, marginLeft: theme.spacing() },
  sessionInfo: { maxWidth: 'max-content' },
  terminalContent: {
    display: 'grid',
    gridTemplateRows: 'max-content 0',
    flexGrow: 1,
    overflow: 'hidden',
    '&.device-connected': {
      gridTemplateRows: 'max-content minmax(min-content, 1fr)'
    }
  },
  terminalStatePlaceholder: {
    width: 280
  }
}));

const ConnectionIndicator = ({ isConnected }) => {
  const { classes } = useStyles();
  return (
    <div className="flexbox center-aligned">
      Remote terminal {<MaterialDesignIcon className={isConnected ? classes.connectedIcon : classes.disconnectedIcon} path={ConsoleIcon} />}
    </div>
  );
};

const tabs = {
  terminal: {
    link: 'session logs',
    title: ConnectionIndicator,
    value: 'terminal',
    canShow: ({ canTroubleshoot, canWriteDevices }) => canTroubleshoot && canWriteDevices
  },
  transfer: { link: 'file transfer logs', title: () => 'File transfer', value: 'transfer', canShow: ({ canTroubleshoot }) => canTroubleshoot }
};

export const TroubleshootDialog = ({ device, onCancel, open, setSocketClosed, type = tabs.terminal.value }) => {
  const [currentTab, setCurrentTab] = useState(type);
  const [availableTabs, setAvailableTabs] = useState(Object.values(tabs));
  const [downloadPath, setDownloadPath] = useState('');
  const [elapsed, setElapsed] = useState(moment());
  const [file, setFile] = useState();
  const [socketInitialized, setSocketInitialized] = useState(undefined);
  const [startTime, setStartTime] = useState();
  const [uploadPath, setUploadPath] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [snackbarAlreadySet, setSnackbarAlreadySet] = useState(false);
  const snackTimer = useRef();
  const timer = useRef();
  const termRef = useRef({ terminal: React.createRef(), terminalRef: React.createRef() });
  const { classes } = useStyles();
  const { isHosted } = useSelector(getFeatures);
  const isEnterprise = useSelector(getIsEnterprise);
  const canPreview = useSelector(getIsPreview);
  const userCapabilities = useSelector(getUserCapabilities);
  const { canAuditlog, canTroubleshoot, canWriteDevices } = userCapabilities;
  const { hasAuditlogs } = useSelector(getTenantCapabilities);
  const dispatch = useDispatch();
  const dispatchedSetSnackbar = useCallback((...args) => dispatch(setSnackbar(...args)), [dispatch]);

  const onNotify = useCallback(
    content => {
      if (snackbarAlreadySet) {
        return;
      }
      setSnackbarAlreadySet(true);
      dispatchedSetSnackbar(content, TIMEOUTS.threeSeconds);
      snackTimer.current = setTimeout(() => setSnackbarAlreadySet(false), TIMEOUTS.threeSeconds + TIMEOUTS.debounceShort);
    },
    [dispatchedSetSnackbar, snackbarAlreadySet]
  );

  const onHealthCheckFailed = useCallback(() => {
    if (!socketInitialized) {
      return;
    }
    onNotify('Health check failed: connection with the device lost.');
  }, [onNotify, socketInitialized]);

  const onSocketClose = useCallback(
    event => {
      if (!socketInitialized) {
        return;
      }
      if (event.wasClean) {
        onNotify(`Connection with the device closed.`);
      } else if (event.code == 1006) {
        // 1006: abnormal closure
        onNotify('Connection to the remote terminal is forbidden.');
      } else {
        onNotify('Connection with the device died.');
      }
      setSocketClosed(true);
    },
    [onNotify, setSocketClosed, socketInitialized]
  );

  const onMessageReceived = useCallback(message => {
    if (!termRef.current.terminal.current) {
      return;
    }
    termRef.current.terminal.current.write(new Uint8Array(message));
  }, []);

  const [connect, sendMessage, close, sessionState, sessionId] = useSession({
    onClose: onSocketClose,
    onHealthCheckFailed,
    onMessageReceived,
    onNotify,
    onOpen: setSocketInitialized
  });

  useEffect(() => {
    setDownloadPath('');
    setUploadPath('');
    setFile();
    if (open) {
      setCurrentTab(type);
      setSocketInitialized(undefined);
      setStartTime();
      return;
    }
    return () => {
      clearTimeout(snackTimer.current);
      if (!open) {
        close();
      }
    };
  }, [open, type, close]);

  useEffect(() => {
    const allowedTabs = Object.values(tabs).reduce((accu, tab) => {
      if (tab.canShow(userCapabilities)) {
        accu.push(tab);
      }
      return accu;
    }, []);
    setAvailableTabs(allowedTabs);
  }, [canTroubleshoot, canWriteDevices, userCapabilities]);

  useEffect(() => {
    if (socketInitialized === undefined) {
      return;
    }
    clearInterval(timer.current);
    if (socketInitialized) {
      setStartTime(new Date());
      dispatchedSetSnackbar('Connection with the device established.', TIMEOUTS.fiveSeconds);
      timer.current = setInterval(() => setElapsed(moment()), TIMEOUTS.halfASecond);
    } else {
      close();
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [close, dispatchedSetSnackbar, socketInitialized]);

  useEffect(() => {
    if (!open || sessionState !== WebSocket.OPEN) {
      return;
    }
    return close;
  }, [close, open, sessionState]);

  useEffect(() => {
    if (!canTroubleshoot || !open || sessionId || sessionState !== WebSocket.CLOSED) {
      return;
    }
    connect(device.id);
  }, [canTroubleshoot, connect, device.id, open, sessionId, sessionState]);

  const onConnectionToggle = () => {
    if (sessionState === WebSocket.CLOSED) {
      setSocketInitialized(undefined);
      connect(device.id);
    } else {
      close();
    }
  };

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length === 1) {
      setFile(acceptedFiles[0]);
      setUploadPath(`/tmp/${acceptedFiles[0].name}`);
      setCurrentTab(tabs.transfer.value);
    }
  };

  const onDownloadClick = useCallback(
    path => {
      setDownloadPath(path);
      dispatch(getDeviceFileDownloadLink(device.id, path)).then(address => {
        const filename = path.substring(path.lastIndexOf('/') + 1) || 'file';
        createDownload(address, filename);
      });
    },
    [dispatch, device.id]
  );

  const onMakeGatewayClick = () => {
    const code = getCode(canPreview);
    setTerminalInput(code);
  };

  const commandHandlers = isHosted && isEnterprise ? [{ key: 'thing', onClick: onMakeGatewayClick, title: 'Promote to Mender gateway' }] : [];

  const visibilityToggle = !socketInitialized ? { maxHeight: 0, overflow: 'hidden' } : {};
  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle className="flexbox">
        <div className={classes.title}>Troubleshoot -</div>
        <DeviceIdentityDisplay device={device} isEditable={false} />
      </DialogTitle>
      <DialogContent className={`dialog-content flexbox column ${classes.content}`}>
        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} textColor="primary" TabIndicatorProps={{ className: 'hidden' }}>
          {availableTabs.map(({ title: Title, value }) => (
            <Tab key={value} label={<Title isConnected={socketInitialized} />} value={value} />
          ))}
        </Tabs>
        {currentTab === tabs.transfer.value && (
          <FileTransfer
            deviceId={device.id}
            downloadPath={downloadPath}
            file={file}
            onDownload={onDownloadClick}
            onUpload={(...args) => dispatch(deviceFileUpload(...args))}
            setDownloadPath={setDownloadPath}
            setFile={setFile}
            setUploadPath={setUploadPath}
            uploadPath={uploadPath}
            userCapabilities={userCapabilities}
          />
        )}
        <div className={`${classes.terminalContent} ${socketInitialized ? 'device-connected' : ''} ${currentTab === tabs.terminal.value ? '' : 'hidden'}`}>
          <TwoColumns
            className={`margin-top-small margin-bottom-small ${classes.sessionInfo}`}
            items={{
              'Session status': socketInitialized ? 'connected' : 'disconnected',
              'Connection start': <MaybeTime value={startTime} />,
              'Duration': startTime ? `${moment.duration(elapsed.diff(moment(startTime))).format('hh:mm:ss', { trim: false })}` : '-'
            }}
          />
          <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop} noClick>
            {({ getRootProps }) => (
              <div {...getRootProps()} style={{ position: 'relative', ...visibilityToggle }}>
                <Terminal
                  onDownloadClick={onDownloadClick}
                  sendMessage={sendMessage}
                  setSnackbar={dispatchedSetSnackbar}
                  socketInitialized={socketInitialized}
                  style={{ position: 'absolute', width: '100%', height: '100%', ...visibilityToggle }}
                  textInput={terminalInput}
                  xtermRef={termRef}
                />
              </div>
            )}
          </Dropzone>
          {!socketInitialized && (
            <div className={`flexbox centered ${classes.connectionButton}`}>
              <Button variant="contained" color="secondary" onClick={onConnectionToggle}>
                Connect Terminal
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions className="flexbox space-between">
        <div>
          {currentTab === tabs.terminal.value ? (
            <Button onClick={onConnectionToggle}>{socketInitialized ? 'Disconnect' : 'Connect'} Terminal</Button>
          ) : (
            <div className={classes.terminalStatePlaceholder} />
          )}
          {canAuditlog && hasAuditlogs && (
            <Button component={Link} to={`/auditlog?objectType=device&objectId=${device.id}&startDate=${BEGINNING_OF_TIME}`}>
              View {tabs[currentTab].link} for this device
            </Button>
          )}
        </div>
        <div>
          {currentTab === tabs.terminal.value && socketInitialized && !!commandHandlers.length && (
            <ListOptions options={commandHandlers} title="Quick commands" />
          )}
          <Button onClick={onCancel}>Close</Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default TroubleshootDialog;
