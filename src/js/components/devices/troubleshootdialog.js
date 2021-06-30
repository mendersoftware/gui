import React, { useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, SvgIcon, Tab, Tabs } from '@material-ui/core';
import { mdiConsole as ConsoleIcon } from '@mdi/js';

import msgpack5 from 'msgpack5';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceFileDownloadLink, deviceFileUpload } from '../../actions/deviceActions';
import { DEVICE_MESSAGE_TYPES as MessageTypes, DEVICE_MESSAGE_PROTOCOLS as MessageProtocols } from '../../constants/deviceConstants';

import theme, { colors } from '../../themes/mender-theme';
import Terminal from './troubleshoot/terminal';
import FileTransfer from './troubleshoot/filetransfer';

momentDurationFormatSetup(moment);
const MessagePack = msgpack5();

const BEGINNING_OF_TIME = '2020-01-01T00:00:00.000Z';

let socket = null;

const ConnectionIndicator = isConnected => {
  return (
    <div className="flexbox center-aligned">
      Remote terminal{' '}
      {
        <SvgIcon fontSize="inherit" style={{ color: isConnected ? colors.green : colors.red, marginLeft: theme.spacing() }}>
          <path d={ConsoleIcon} />
        </SvgIcon>
      }
    </div>
  );
};

const tabs = {
  terminal: { link: 'session logs', title: ConnectionIndicator, value: 'terminal' },
  transfer: { link: 'file transfer logs', title: () => 'File transfer', value: 'transfer' }
};

export const TroubleshootDialog = ({
  deviceId,
  deviceFileUpload,
  getDeviceFileDownloadLink,
  isEnterprise,
  onCancel,
  onSocketClose,
  open,
  setSnackbar,
  setSocketClosed,
  type = tabs.terminal.value
}) => {
  const timer = useRef();

  const [currentTab, setCurrentTab] = useState(type);
  const [downloadPath, setDownloadPath] = useState('');
  const [elapsed, setElapsed] = useState(moment());
  const [file, setFile] = useState();
  const [sessionId, setSessionId] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [startTime, setStartTime] = useState();
  const [uploadPath, setUploadPath] = useState('');

  useEffect(() => {
    if (open) {
      setCurrentTab(type);
      return;
    }
    setDownloadPath('');
    setUploadPath('');
    setFile();
  }, [open]);

  useEffect(() => {
    if (socket && !socketInitialized) {
      onSocketClose();
    }
    if (socketInitialized) {
      setStartTime(new Date());
      timer.current = setInterval(() => setElapsed(moment()), 500);
    } else {
      clearInterval(timer.current);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [socketInitialized]);

  useEffect(() => {
    if (!(open || socketInitialized) || socketInitialized) {
      return;
    }
    socket = new WebSocket(`wss://${window.location.host}/api/management/v1/deviceconnect/devices/${deviceId}/connect`);

    return () => {
      onSendMessage({ typ: MessageTypes.Stop });
      setSessionId(null);
      setSocketInitialized(false);
    };
  }, [deviceId, open]);

  const onSendMessage = ({ typ, body, props }) => {
    if (!socket) {
      return;
    }
    const proto_header = { proto: MessageProtocols.Shell, typ, sid: sessionId, props };
    const encodedData = MessagePack.encode({ hdr: proto_header, body });
    socket.send(encodedData);
  };

  const onConnectionToggle = () => {
    if (socketInitialized) {
      onSendMessage({ typ: MessageTypes.Stop, body: {}, props: {} });
    } else {
      setSocketInitialized(false);
      socket = new WebSocket(`wss://${window.location.host}/api/management/v1/deviceconnect/devices/${deviceId}/connect`);
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
    getDeviceFileDownloadLink(deviceId, path).then(address => {
      const fileName = path.substring(path.lastIndexOf('/') + 1) || 'file';
      const link = document.createElement('a');
      link.setAttribute('href', address);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const onSetSocketClosed = () => {
    socket = null;
    setSocketClosed();
  };

  const duration = moment.duration(elapsed.diff(moment(startTime)));
  const visibilityToggle = !socket ? { maxHeight: 0, overflow: 'hidden' } : {};
  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Troubleshoot</DialogTitle>
      <DialogContent className="dialog-content flexbox column" style={{ padding: 0, margin: '0 24px', height: '75vh' }}>
        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} textColor="primary" TabIndicatorProps={{ className: 'hidden' }}>
          {Object.values(tabs).map(tab => (
            <Tab key={tab.value} label={tab.title(sessionId)} value={tab.value} />
          ))}
        </Tabs>
        {currentTab === tabs.transfer.value && (
          <FileTransfer
            deviceId={deviceId}
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
            gridTemplateRows: `max-content ${socket ? 'minmax(min-content, 1fr)' : '0'}`,
            flexGrow: 1,
            overflow: 'hidden'
          }}
        >
          <div className="margin-top-small margin-bottom-small">
            <div>
              <b>Session status:</b> {sessionId ? 'connected' : 'disconnected'}
            </div>
            <div>
              <b>Connection start:</b> {startTime ? <Time value={startTime} format="YYYY-MM-DD HH:mm" /> : '-'}
            </div>
            <div>
              <b>Duration:</b> {`${duration.format('hh:mm:ss', { trim: false })}`}
            </div>
          </div>
          <Dropzone activeClassName="active" rejectClassName="active" multiple={false} onDrop={onDrop}>
            {({ getRootProps }) => (
              <div {...getRootProps()} style={{ position: 'relative', ...visibilityToggle }}>
                <Terminal
                  onDownloadClick={onDownloadClick}
                  sendMessage={onSendMessage}
                  setSessionId={setSessionId}
                  setSnackbar={setSnackbar}
                  setSocketClosed={onSetSocketClosed}
                  setSocketInitialized={setSocketInitialized}
                  socket={socket}
                  socketInitialized={socketInitialized}
                  style={{ position: 'absolute', width: '100%', height: '100%', ...visibilityToggle }}
                />
              </div>
            )}
          </Dropzone>
          {!socket && (
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
            <Button onClick={onConnectionToggle}>{sessionId ? 'Disconnect' : 'Connect'} Terminal</Button>
          ) : (
            <div style={{ width: 280 }} />
          )}
          {isEnterprise && (
            <Button component={Link} to={`auditlog?object_id=${deviceId}&start_date=${BEGINNING_OF_TIME}`}>
              View {tabs[currentTab].link} for this device
            </Button>
          )}
        </div>
        <Button onClick={onCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { getDeviceFileDownloadLink, deviceFileUpload, setSnackbar };

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps, actionCreators)(TroubleshootDialog);
