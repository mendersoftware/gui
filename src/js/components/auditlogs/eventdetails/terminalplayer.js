import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import msgpack5 from 'msgpack5';
import { deviceConnect } from '../../../actions/deviceActions';
import { MessageProtocol, MessageTypes, blobToString, byteArrayToString } from '../../devices/terminal';
import { CloudDownload, Pause, PlayArrow, Refresh } from '@material-ui/icons';
import { colors } from '../../../themes/mender-theme';

const MessagePack = msgpack5();
const fitAddon = new FitAddon();
const searchAddon = new SearchAddon();

let socket = null;
let buffer = [];

export const TerminalPlayer = ({ className, item, sessionInitialized }) => {
  const xtermRef = useRef(null);
  const [term, setTerminal] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [bufferIndex, setBufferIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasStarted, setWasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!sessionInitialized) {
      return;
    }
    setTerminal(xtermRef.current.terminal);
    socket = new WebSocket(`wss://${window.location.host}${deviceConnect}/sessions/${item.meta.session_id[0]}/playback`);

    socket.onopen = () => {
      setSocketInitialized(true);
    };
  }, [sessionInitialized]);

  useEffect(() => {
    if (!socketInitialized) {
      return;
    }
    buffer = [];
    socket.onmessage = event =>
      blobToString(event.data).then(data => {
        const {
          hdr: { proto, typ },
          body
        } = MessagePack.decode(data);
        if (proto !== MessageProtocol.Shell) {
          return;
        }
        switch (typ) {
          case MessageTypes.Shell:
            return buffer.push({ content: body });
          case MessageTypes.Delay:
            return buffer.push({ delay: body });
          default:
            break;
        }
      });
  }, [socketInitialized]);

  useEffect(() => {
    if (isPlaying && bufferIndex < buffer.length) {
      if (bufferIndex === 0) {
        term.reset();
      }
      if (buffer[bufferIndex].content) {
        term.write(byteArrayToString(buffer[bufferIndex].content));
      }
      setTimeout(() => setBufferIndex(bufferIndex + 1), 500);
      if (buffer[bufferIndex].delay) {
        setTimeout(() => {
          setBufferIndex(bufferIndex + 1);
        }, Math.max(buffer[bufferIndex].delay, 300));
      }
    } else if (!isPaused) {
      resetPlayer();
    }
  }, [bufferIndex, isPaused, isPlaying]);

  const resetPlayer = () => {
    setIsPlaying(false);
    setBufferIndex(0);
  };

  const onTogglePlayClick = () => {
    if (!wasStarted) {
      setWasStarted(true);
      return setTimeout(() => {
        fitAddon.fit();
        term.focus();
        setIsPlaying(!isPlaying);
      }, 300);
    }
    setIsPaused(isPlaying);
    setIsPlaying(!isPlaying);
  };

  const onReplayClick = () => {
    resetPlayer();
    setIsPlaying(true);
  };

  const onDownloadClick = () => {
    console.log('meh');
  };

  return (
    <div className={`${className} `}>
      <div className="relative">
        <XTerm addons={[fitAddon, searchAddon]} className="xterm-fullscreen" ref={xtermRef} options={{ scrollback: 5000 }} />
        {!wasStarted && (
          <div
            className="flexbox centered clickable"
            style={{ background: 'black', width: '100%', height: '100%', position: 'absolute', top: 0, zIndex: 10 }}
            onClick={onTogglePlayClick}
          >
            <PlayArrow color="disabled" style={{ fontSize: '7rem', color: colors.grey }} />
          </div>
        )}
      </div>
      <div className="flexbox margin-top-small margin-bottom-small">
        <Button color="primary" onClick={onTogglePlayClick} startIcon={isPlaying ? <Pause /> : <PlayArrow />}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button color="primary" onClick={onReplayClick} disabled={isPlaying} startIcon={<Refresh />}>
          Replay
        </Button>
        <Button color="primary" onClick={onDownloadClick} startIcon={<CloudDownload />}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default TerminalPlayer;
