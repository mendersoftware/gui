import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import msgpack5 from 'msgpack5';

import { setSnackbar } from '../../actions/appActions';

// see https://github.com/mendersoftware/go-lib-micro/tree/master/ws
//     for the description of proto_header and the consts
// *Note*: this needs to be aligned with mender-connect and deviceconnect.
const MessageProtocolShell = 1;

const MessageTypeNew = 'new';
const MessageTypePing = 'ping';
const MessageTypePong = 'pong';
const MessageTypeResize = 'resize';
const MessageTypeShell = 'shell';
const MessageTypeStop = 'stop';

const MessagePack = msgpack5();

const fitAddon = new FitAddon();
const searchAddon = new SearchAddon();

const byteArrayToString = body => String.fromCharCode(...body);

const blobToString = blob => {
  return new Promise(resolve => {
    let fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsArrayBuffer(blob);
  });
};

const options = {
  cursorBlink: 'block',
  macOptionIsMeta: true,
  scrollback: 100
};

let socket = null;
let healthcheckTimeout = null;

export const Terminal = ({ onCancel, sendMessage, setSnackbar, setSessionId, setSocketInitialized, socketInitialized }) => {
  const xtermRef = useRef(null);
  const [dimensions, setDimensions] = useState({});
  const [healthcheckHasFailed, setHealthcheckHasFailed] = useState(false);
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
  const [snackbarAlreadySet, setSnackbarAlreadySet] = useState(false);
  const [term, setTerminal] = useState(null);

  const healthcheckFailed = () => {
    setHealthcheckHasFailed(true);
    cleanupSocket();
  };

  useEffect(() => {
    // if (!socket) {
    //   return;
    // }
    setTerminal(xtermRef.current.terminal);
    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', 5000);
    }

    socket.onopen = () => {
      setSnackbar('Connection with the device established.', 5000);
      setSocketInitialized(true);
    };

    socket.onclose = event => {
      if (!snackbarAlreadySet && healthcheckHasFailed) {
        setSnackbar('Health check failed: connection with the device lost.', 5000);
      } else if (!snackbarAlreadySet && event.wasClean) {
        setSnackbar(`Connection with the device closed.`, 5000);
      } else if (!snackbarAlreadySet) {
        setSnackbar('Connection with the device died.', 5000);
      }
      if (xtermRef.current) {
        onCancel();
      }
    };

    socket.onerror = error => {
      setSnackbar(`WebSocket error: ${error.message}`, 5000);
      cleanupSocket();
    };
    // xtermRef.current = null;
  }, []);

  useEffect(() => {
    if (!socketInitialized) {
      return;
    }
    fitAddon.fit();
    let newDimensions = fitAddon.proposeDimensions();
    //
    const message = {
      typ: MessageTypeNew,
      props: { terminal_height: newDimensions.rows, terminal_width: newDimensions.cols }
    };
    sendMessage(message);
    setDimensions(newDimensions);
    term.focus();
    socket.onmessage = event =>
      blobToString(event.data).then(data => {
        const {
          hdr: { props = {}, proto, sid, typ },
          body
        } = MessagePack.decode(data);
        if (proto !== MessageProtocolShell) {
          return;
        }
        switch (typ) {
          case MessageTypeNew: {
            if (props.status == 2) {
              setSnackbar(`Error: ${byteArrayToString(body)}`, 5000);
              setSnackbarAlreadySet(true);
              return cleanupSocket();
            } else {
              return setSessionId(sid);
            }
          }
          case MessageTypeShell:
            return term.write(byteArrayToString(body));
          case MessageTypeStop: {
            return cleanupSocket();
          }
          case MessageTypePing: {
            if (healthcheckTimeout) {
              clearTimeout(healthcheckTimeout);
            }
            sendMessage({ typ: MessageTypePong });
            //
            var timeout = parseInt(props.timeout);
            if (timeout > 0) {
              healthcheckTimeout = setTimeout(healthcheckFailed, timeout * 1000);
            }
            return;
          }
          default:
            break;
        }
      });
  }, [socketInitialized]);

  useEffect(() => {
    if (!socketInitialized || !term) {
      return;
    }
    fitAddon.fit();
    const newDimensions = fitAddon.proposeDimensions();
    if (newDimensions.rows != dimensions.rows || newDimensions.cols != dimensions.cols) {
      //
      const message = {
        typ: MessageTypeResize,
        props: { terminal_height: newDimensions.rows, terminal_width: newDimensions.cols }
      };
      sendMessage(message);
      setDimensions(newDimensions);
    }
  }, [size]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setSize({ height: window.innerHeight, width: window.innerWidth });
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cleanupSocket = () => {
    socket.close();
    socket = null;
    if (xtermRef.current) {
      setSocketInitialized(false);
      onCancel();
    }
  };

  const onData = data => sendMessage({ typ: MessageTypeShell, body: data });

  return <XTerm ref={xtermRef} addons={[fitAddon, searchAddon]} options={options} onData={onData} className="xterm-fullscreen" />;
};

export const TerminalDialog = ({ deviceId, onCancel, onSocketClose, open, setSnackbar }) => {
  const [sessionId, setSessionId] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);

  useEffect(() => {
    if (!socketInitialized) {
      onSocketClose();
    }
  }, [socketInitialized]);

  useEffect(() => {
    if (!(open || socketInitialized) || socketInitialized) {
      return;
    }
    socket = new WebSocket(`wss://${window.location.host}/api/management/v1/deviceconnect/devices/${deviceId}/connect`);

    return () => {
      onSendMessage({ typ: MessageTypeStop });
      setSessionId(null);
      setSocketInitialized(false);
    };
  }, [deviceId, open]);

  const onSendMessage = ({ typ, body, props }) => {
    if (!socket) {
      return;
    }
    const proto_header = { proto: MessageProtocolShell, typ, sid: sessionId, props };
    const encodedData = MessagePack.encode({ hdr: proto_header, body });
    socket.send(encodedData);
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent className="dialog-content" style={{ padding: 0, margin: '0 24px', height: '75vh' }}>
        <Terminal
          onCancel={onCancel}
          sendMessage={onSendMessage}
          setSessionId={setSessionId}
          setSnackbar={setSnackbar}
          setSocketInitialized={setSocketInitialized}
          socketInitialized={socketInitialized}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { setSnackbar };

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps, actionCreators)(TerminalDialog);
