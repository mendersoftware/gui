import { useCallback, useEffect, useRef, useState } from 'react';

import msgpack5 from 'msgpack5';

import { apiUrl } from '../api/general-api';
import { TIMEOUTS } from '../constants/appConstants';
import { DEVICE_MESSAGE_PROTOCOLS as MessageProtocols, DEVICE_MESSAGE_TYPES as MessageTypes } from '../constants/deviceConstants';

const MessagePack = msgpack5();

export const byteArrayToString = body => String.fromCharCode(...body);

export const blobToString = blob => {
  return new Promise(resolve => {
    let fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsArrayBuffer(blob);
  });
};

export const useSession = ({ onClose, onHealthCheckFailed, onMessageReceived, onNotify, onOpen }) => {
  const [sessionId, setSessionId] = useState();
  const healthcheckTimeout = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.addEventListener('close', onClose);
    return () => {
      socketRef.current.removeEventListener('close', onClose);
    };
  }, [socketRef.current, onClose]);

  const close = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendMessage({ typ: MessageTypes.Stop, body: {}, props: {} });
      socketRef.current.close();
    }
  }, [socketRef.current]);

  const sendMessage = useCallback(
    ({ typ, body, props }) => {
      if (!socketRef.current) {
        return;
      }
      const proto_header = { proto: MessageProtocols.Shell, typ, sid: sessionId, props };
      const encodedData = MessagePack.encode({ hdr: proto_header, body });
      socketRef.current.send(encodedData);
    },
    [socketRef.current, sessionId]
  );

  const onSocketMessage = useCallback(
    event =>
      blobToString(event.data).then(data => {
        const {
          hdr: { props = {}, proto, sid, typ },
          body
        } = MessagePack.decode(data);
        if (proto !== MessageProtocols.Shell) {
          return;
        }
        switch (typ) {
          case MessageTypes.New: {
            if (props.status == WebSocket.CLOSING) {
              onNotify(`Error: ${byteArrayToString(body)}`);
              return close();
            } else {
              clearTimeout(healthcheckTimeout.current);
              healthcheckTimeout.current = setTimeout(healthcheckFailed, 65 * TIMEOUTS.oneSecond);
              return setSessionId(sid);
            }
          }
          case MessageTypes.Shell:
            return onMessageReceived(body);
          case MessageTypes.Stop:
            return close();
          case MessageTypes.Ping: {
            if (healthcheckTimeout.current) {
              clearTimeout(healthcheckTimeout.current);
            }
            sendMessage({ typ: MessageTypes.Pong });
            //
            const timeout = parseInt(props.timeout);
            if (timeout > 0) {
              healthcheckTimeout.current = setTimeout(healthcheckFailed, timeout * TIMEOUTS.oneSecond);
            }
            return;
          }
          default:
            break;
        }
      }),
    [close, onMessageReceived, onNotify, sendMessage, setSessionId]
  );

  const onSocketError = useCallback(
    error => {
      onNotify(`WebSocket error: ${error.message}`);
      close();
    },
    [close, onNotify]
  );

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.addEventListener('error', onSocketError);
    return () => {
      socketRef.current.removeEventListener('error', onSocketError);
    };
  }, [socketRef.current, onSocketError]);

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.addEventListener('message', onSocketMessage);
    return () => {
      socketRef.current.removeEventListener('message', onSocketMessage);
    };
  }, [socketRef.current, onSocketMessage]);

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.addEventListener('open', onOpen);
    return () => {
      socketRef.current.removeEventListener('open', onOpen);
    };
  }, [socketRef.current, onOpen]);

  const healthcheckFailed = () => {
    onHealthCheckFailed();
    close();
  };

  const connect = useCallback(deviceId => {
    const uri = `wss://${window.location.host}${apiUrl.v1}/deviceconnect/devices/${deviceId}/connect`;
    setSessionId();
    socketRef.current = new WebSocket(uri);
  }, []);

  return [connect, sendMessage, close, socketRef.current?.readyState, sessionId];
};
