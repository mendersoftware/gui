import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import msgpack5 from 'msgpack5';

import { setSnackbar } from '../../actions/appActions';

// see https://github.com/mendersoftware/go-lib-micro/tree/master/ws
//     for the description of proto_header and the consts
// *Note*: this needs to be aligned with mender-shell and deviceconnect.
const MessageProtocolShell = 1;
const MessageTypeShell = 'shell';
const MessageTypeNew = 'new';
const MessageTypeStop = 'stop';

const MessagePack = msgpack5();

export const Terminal = props => {
  const { deviceId, sessionId, socket, setSessionId, setSocket, setSnackbar, onCancel } = props;
  const xtermRef = React.useRef(null);

  const onData = data => {
    const proto_header = { proto: MessageProtocolShell, typ: MessageTypeShell, sid: sessionId, props: null };
    const msg = { hdr: proto_header, body: data };

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
      const proto_header = { proto: MessageProtocolShell, typ: MessageTypeNew, sid: null, props: null };
      const msg = { hdr: proto_header };
      const encodedData = MessagePack.encode(msg);
      socket.send(encodedData);
    };

    socket.onclose = event => {
      if (event.wasClean) {
        setSnackbar(`Connection with the device closed.`, 5000);
      } else {
        setSnackbar('Connection with the device died.', 5000);
        onCancel();
      }
    };

    socket.onerror = error => {
      setSnackbar('WebSocket error: ' + error.message, 5000);
      onCancel();
    };

    socket.onmessage = event => {
      event.data.arrayBuffer().then(function (data) {
        const obj = MessagePack.decode(data);
        if (obj.hdr.typ === MessageTypeNew) {
          setSessionId(obj.hdr.sid);
        } else if (obj.hdr.typ === MessageTypeShell) {
          var myString = '';
          for (var i = 0; i < obj.body.byteLength; i++) {
            myString += String.fromCharCode(obj.body[i]);
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
    const proto_header = { proto: 1, typ: MessageTypeStop, sid: sessionId, props: null };
    const msg = { hdr: proto_header, body: null };
    const encodedData = MessagePack.encode(msg);
    socket.send(encodedData);
    setSocket(null);
    onCancel();
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent className="dialog-content" style={{ padding: 0 }}>
        <Terminal
          deviceId={deviceId}
          sessionId={sessionId}
          socket={socket}
          setSessionId={setSessionId}
          setSocket={setSocket}
          setSnackbar={setSnackbar}
          onCancel={onCancel}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps, actionCreators)(TerminalDialog);
