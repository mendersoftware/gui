import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { mdiConsole as ConsoleIcon } from '@mdi/js';

import { setSnackbar } from '../../../actions/appActions';
import { getDeviceFileDownloadLink, deviceFileUpload } from '../../../actions/deviceActions';
import { BEGINNING_OF_TIME } from '../../../constants/appConstants';

import { colors } from '../../../themes/Mender';
import MaterialDesignIcon from '../../common/materialdesignicon';
import Time from '../../common/time';
import Terminal from '../troubleshoot/terminal';
import FileTransfer from '../troubleshoot/filetransfer';
import { createDownload, versionCompare } from '../../../helpers';
import ListOptions from '../widgets/listoptions';
import { getCode } from './make-gateway-dialog';
import { getFeatures, getIdAttribute, getIsEnterprise, getUserRoles } from '../../../selectors';
import DeviceIdentityDisplay from './../../common/deviceidentity';
import { useSession } from '../../../utils/sockethook';

momentDurationFormatSetup(moment);

const ConnectionIndicator = isConnected => {
  const theme = useTheme();
  return (
    <div className="flexbox center-aligned">
      Remote terminal {<MaterialDesignIcon path={ConsoleIcon} style={{ color: isConnected ? colors.green : colors.red, marginLeft: theme.spacing() }} />}
    </div>
  );
};

const tabs = {
  terminal: { link: 'session logs', title: ConnectionIndicator, value: 'terminal', needsWriteAccess: true, needsTroubleshoot: true },
  transfer: { link: 'file transfer logs', title: () => 'File transfer', value: 'transfer', needsWriteAccess: false, needsTroubleshoot: false }
};

export const TroubleshootDialog = ({
  canPreview,
  device,
  deviceFileUpload,
  getDeviceFileDownloadLink,
  hasAuditlogs,
  isEnterprise,
  isHosted,
  idAttribute,
  onCancel,
  open,
  setSnackbar,
  setSocketClosed,
  type = tabs.terminal.value,
  userCapabilities
}) => {
  const { canAuditlog, canTroubleshoot, canWriteDevices: hasWriteAccess } = userCapabilities;

  const [currentTab, setCurrentTab] = useState(type);
  const [availableTabs, setAvailableTabs] = useState(Object.values(tabs));
  const [downloadPath, setDownloadPath] = useState('');
  const [elapsed, setElapsed] = useState(moment());
  const [file, setFile] = useState();
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [startTime, setStartTime] = useState();
  const [uploadPath, setUploadPath] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [snackbarAlreadySet, setSnackbarAlreadySet] = useState(false);
  const closeTimer = useRef();
  const snackTimer = useRef();
  const timer = useRef();
  const termRef = useRef();

  useEffect(() => {
    if (open) {
      setCurrentTab(type);
      return;
    }
    setDownloadPath('');
    setUploadPath('');
    setFile();
    return () => {
      clearTimeout(closeTimer.current);
      clearTimeout(snackTimer.current);
    };
  }, [open]);

  useEffect(() => {
    const allowedTabs = Object.values(tabs).reduce((accu, tab) => {
      if ((tab.needsWriteAccess && !hasWriteAccess) || (tab.needsTroubleshoot && !canTroubleshoot)) {
        return accu;
      }
      accu.push(tab);
      return accu;
    }, []);
    setAvailableTabs(allowedTabs);
  }, [canTroubleshoot, hasWriteAccess]);

  useEffect(() => {
    if (socketInitialized === undefined) {
      return;
    }
    clearInterval(timer.current);
    if (socketInitialized) {
      setStartTime(new Date());
      timer.current = setInterval(() => setElapsed(moment()), 500);
    } else {
      close();
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [socketInitialized]);

  useEffect(() => {
    if (!(open || socketInitialized) || socketInitialized) {
      return;
    }
    canTroubleshoot ? connect(device.id) : undefined;
    return () => {
      close();
      setTimeout(() => setSocketClosed(true), 5000);
    };
  }, [device.id, open]);

  const onConnectionToggle = () => {
    if (socketInitialized) {
      close();
    } else {
      setSocketInitialized(false);
      connect(device.id);
    }
  };

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length === 1) {
      setFile(acceptedFiles[0]);
      setUploadPath(`/tmp/${acceptedFiles[0].name}`);
      setCurrentTab(tabs.transfer.value);
    }
  };

  const onDownloadClick = path => {
    setDownloadPath(path);
    getDeviceFileDownloadLink(device.id, path).then(address => {
      const filename = path.substring(path.lastIndexOf('/') + 1) || 'file';
      createDownload(address, filename);
    });
  };

  const onSocketOpen = () => {
    setSnackbar('Connection with the device established.', 5000);
    setSocketInitialized(true);
  };

  const onNotify = content => {
    setSnackbarAlreadySet(true);
    setSnackbar(content, 5000);
    snackTimer.current = setTimeout(() => setSnackbarAlreadySet(false), 5300);
  };

  const onHealthCheckFailed = () => {
    if (snackbarAlreadySet) {
      return;
    }
    onNotify('Health check failed: connection with the device lost.');
  };

  const onSocketClose = event => {
    if (snackbarAlreadySet) {
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
    closeTimer.current = setTimeout(() => setSocketClosed(true), 5000);
  };

  const onMessageReceived = useCallback(
    message => {
      if (!termRef.current.terminal) {
        return;
      }
      termRef.current.terminal.write(new Uint8Array(message));
    },
    [termRef.current]
  );

  const [connect, sendMessage, close, sessionState, sessionId] = useSession({
    onClose: onSocketClose,
    onHealthCheckFailed,
    onMessageReceived,
    onNotify,
    onOpen: onSocketOpen
  });

  useEffect(() => {
    setSocketInitialized(sessionState === WebSocket.OPEN && sessionId);
  }, [sessionId, sessionState]);

  const onMakeGatewayClick = () => {
    const code = getCode(canPreview);
    setTerminalInput(code);
  };

  const commandHandlers = isHosted && isEnterprise ? [{ key: 'thing', onClick: onMakeGatewayClick, title: 'Promote to Mender gateway' }] : [];

  const duration = moment.duration(elapsed.diff(moment(startTime)));
  const visibilityToggle = !socketInitialized ? { maxHeight: 0, overflow: 'hidden' } : {};
  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>
        Troubleshoot - <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
      </DialogTitle>
      <DialogContent className="dialog-content flexbox column" style={{ padding: 0, margin: '0 24px', height: '75vh' }}>
        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} textColor="primary" TabIndicatorProps={{ className: 'hidden' }}>
          {availableTabs.map(tab => (
            <Tab key={tab.value} label={tab.title(socketInitialized)} value={tab.value} />
          ))}
        </Tabs>
        {currentTab === tabs.transfer.value && (
          <FileTransfer
            deviceId={device.id}
            downloadPath={downloadPath}
            file={file}
            onDownload={onDownloadClick}
            onUpload={deviceFileUpload}
            setDownloadPath={setDownloadPath}
            setFile={setFile}
            setSnackbar={setSnackbar}
            setUploadPath={setUploadPath}
            uploadPath={uploadPath}
          />
        )}
        <div
          className={`${currentTab === tabs.terminal.value ? '' : 'hidden'}`}
          style={{
            display: 'grid',
            gridTemplateRows: `max-content ${socketInitialized ? 'minmax(min-content, 1fr)' : '0'}`,
            flexGrow: 1,
            overflow: 'hidden'
          }}
        >
          <div className="margin-top-small margin-bottom-small">
            <div>
              <b>Session status:</b> {socketInitialized ? 'connected' : 'disconnected'}
            </div>
            <div>
              <b>Connection start:</b> {startTime ? <Time value={startTime} /> : '-'}
            </div>
            <div>
              <b>Duration:</b> {`${duration.format('hh:mm:ss', { trim: false })}`}
            </div>
          </div>
          <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop} noClick>
            {({ getRootProps }) => (
              <div {...getRootProps()} style={{ position: 'relative', ...visibilityToggle }}>
                <Terminal
                  onDownloadClick={onDownloadClick}
                  sendMessage={sendMessage}
                  sessionId={sessionId}
                  setSnackbar={setSnackbar}
                  socketInitialized={socketInitialized}
                  style={{ position: 'absolute', width: '100%', height: '100%', ...visibilityToggle }}
                  textInput={terminalInput}
                  xtermRef={termRef}
                />
              </div>
            )}
          </Dropzone>
          {!socketInitialized && (
            <div className="flexbox centered" style={{ background: colors.textColor }}>
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
            <div style={{ width: 280 }} />
          )}
          {canAuditlog && hasAuditlogs && (
            <Button component={Link} to={`auditlog?object_id=${device.id}&start_date=${BEGINNING_OF_TIME}`}>
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

const actionCreators = { getDeviceFileDownloadLink, deviceFileUpload, setSnackbar };

const mapStateToProps = state => {
  const { isHosted } = getFeatures(state);
  return {
    canPreview: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    idAttribute: getIdAttribute(state),
    isEnterprise: getIsEnterprise(state),
    isHosted,
    userRoles: getUserRoles(state)
  };
};

export default connect(mapStateToProps, actionCreators)(TroubleshootDialog);
