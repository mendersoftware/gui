import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import msgpack5 from 'msgpack5';
import Cookies from 'universal-cookie';

import { setSnackbar } from '../../actions/appActions';

import { decodeSessionToken } from '../../helpers';

const MessageTypeShell = 'shell';
const MessageTypeNew = 'new';
const MessageTypeStop = 'stop';

const cookies = new Cookies();
const MessagePack = msgpack5();

export const Terminal = props => {
  const { deviceId, sessionId, socket, setSessionId, setSocket, setSnackbar } = props;
  const xtermRef = React.useRef(null);
  const userId = decodeSessionToken(cookies.get('JWT'));

  const onData = data => {
    const msg = { type: MessageTypeShell, status: 0, session_id: sessionId, data: data };
    const encodedData = MessagePack.encode(msg);
    socket.send(encodedData);
  };

  React.useEffect(() => {
    const term = xtermRef.current.terminal;

    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', 5000);
    }
    term.resize(80, 40);

    var socket = new WebSocket('wss://' + window.location.host + '/api/management/v1/deviceconnect/devices/' + deviceId + '/connect');
    socket.onopen = () => {
      setSnackbar('Connection with the device established.', 5000);
      //
      const msg = { type: MessageTypeNew, status: 0, session_id: null, data: userId };
      const encodedData = MessagePack.encode(msg);
      socket.send(encodedData);
    };

    socket.onclose = event => {
      if (event.wasClean) {
        setSnackbar(`Connection with the device closed.`, 5000);
      } else {
        setSnackbar('Connection with the device died.', 5000);
      }
    };

    socket.onerror = error => {
      setSnackbar('WebSocket error: ' + error.message, 5000);
    };

    socket.onmessage = event => {
      event.data.arrayBuffer().then(function (data) {
        const obj = MessagePack.decode(data);
        if (obj.type === MessageTypeNew) {
          setSessionId(obj.session_id);
        } else if (obj.type === MessageTypeShell) {
          var myString = '';
          for (var i = 0; i < obj.data.byteLength; i++) {
            myString += String.fromCharCode(obj.data[i]);
          }
          term.write(myString);
        }
      });
    };

    setSocket(socket);
  }, []);

  const options = {
    cursorBlink: 'block',
    macOptionIsMeta: true,
    scrollback: 100
  };

  const fitAddon = new FitAddon();
  const searchAddon = new SearchAddon();

  return <XTerm ref={xtermRef} addons={[fitAddon, searchAddon]} options={options} onData={onData} />;
};

const actionCreators = { setSnackbar };

const mapStateToProps = () => {
  return {};
};

export const TerminalDialog = props => {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { open, onCancel, deviceId, setSnackbar } = props;

  const onClose = () => {
    const msg = { type: MessageTypeStop, status: 0, session_id: sessionId };
    const encodedData = MessagePack.encode(msg);
    socket.send(encodedData);
    //
    setSocket(null);
    onCancel();
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent className="dialog-content" style={{ padding: 0 }}>
        <Terminal deviceId={deviceId} sessionId={sessionId} socket={socket} setSessionId={setSessionId} setSocket={setSocket} setSnackbar={setSnackbar} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps, actionCreators)(TerminalDialog);
