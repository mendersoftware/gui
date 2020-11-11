import React, { useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import msgpack5 from 'msgpack5';
import Cookies from 'universal-cookie';

import { decodeSessionToken } from '../../helpers';

export const Terminal = props => {
  const { deviceId } = props;
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const xtermRef = React.useRef(null);
  const MessagePack = msgpack5();
  const cookies = new Cookies();
  const userId = decodeSessionToken(cookies.get('JWT'));

  const onData = data => {
    const msg = { type: 'shell', status: 0, session_id: sessionId, data: data };
    const encodedData = MessagePack.encode(msg);
    socket.send(encodedData);
  };

  React.useEffect(() => {
    const term = xtermRef.current.terminal;

    fitAddon.fit();
    term.resize(80, 40);

    var socket = new WebSocket('wss://' + window.location.host + '/api/management/v1/deviceconnect/devices/' + deviceId + '/connect');
    socket.onopen = () => {
      console.log('[websocket] Connection established');
      //
      const msg = { type: 'new', status: 0, session_id: null, data: userId };
      const encodedData = MessagePack.encode(msg);
      socket.send(encodedData);
    };

    socket.onclose = event => {
      if (event.wasClean) {
        console.log('[close] Connection closed cleanly, code=' + event.code + ' reason=' + event.reason);
      } else {
        console.log('[close] Connection died');
      }
    };

    socket.onerror = error => {
      console.log('[error] ' + error.message);
    };

    socket.onmessage = event => {
      event.data.arrayBuffer().then(function (data) {
        const obj = MessagePack.decode(data);
        if (obj.type === 'new') {
          setSessionId(obj.session_id);
        } else if (obj.type === 'shell') {
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

export const TerminalDialog = props => {
  const { open, onCancel, deviceId } = props;

  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent className="dialog-content" style={{ padding: 0 }}>
        <Terminal deviceId={deviceId} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TerminalDialog;
