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

const generateHtml = (versions, content) => {
  const { fit, search, xterm } = Object.entries(versions).reduce((accu, [key, version]) => {
    accu[key] = version.match(/(?<version>\d.*)/).groups.version;
    return accu;
  }, {});
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/xterm@${xterm}/css/xterm.css" />
      <script src="https://unpkg.com/xterm@${xterm}/lib/xterm.js"></script>
      <script src="https://unpkg.com/xterm-addon-search@${search}/lib/xterm-addon-search.js"></script>
      <script src="https://unpkg.com/xterm-addon-fit@${fit}/lib/xterm-addon-fit.js"></script>
      <style type="text/css">
        body {
          display: grid;
          justify-items: center;
          max-width: 80vw;
          margin: 10vh auto;
          row-gap: 5vh;
          font-family: 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        h2 {
          color: #24444a;
        }
        button {
          background-color: #921267;
          padding: 1.3em 3.4em;
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
          border: 0;
          border-radius: 3px;
          cursor: pointer;
        }
        .disabled {
          background-color: lightgrey;
          opacity: 0.4;
        }
      </style>
    </head>
    <body>
      <img src="https://vgy.me/0tXIM6.png" alt="mender-logo" />
      <h2>Terminal playback</h2>
      <div id="terminal"></div>
      <div>
        <button id="start" onclick="handleStart()">Start</button>
        <button id="pause" class="disabled" disabled onclick="handlePause()">Pause</button>
        <button id="stop" class="disabled" disabled onclick="handleStop()">Stop</button>
      </div>
      <script>
        const byteArrayToString = body => String.fromCharCode(...body);
        const transfer = '${JSON.stringify(content.map(item => ({ time: item.time, content: btoa(JSON.stringify(item.content)) })))}';
        const content = JSON.parse(transfer);
        let contentIndex = 0;
        let timer;
        const term = new Terminal();
        const fitAddon = new FitAddon.FitAddon();
        const searchAddon = new SearchAddon.SearchAddon();
        term.loadAddon(searchAddon);
        term.loadAddon(fitAddon);
        term.open(document.getElementById('terminal'));
        fitAddon.fit();
        const startButton = document.getElementById('start');
        const pauseButton = document.getElementById('pause');
        const stopButton = document.getElementById('stop');

        const resetPlayer = () => {
          contentIndex = 0;
          term.reset()
          startButton.toggleAttribute('disabled');
          pauseButton.toggleAttribute('disabled');
          stopButton.toggleAttribute('disabled');
          pauseButton.classList.toggle('disabled');
          stopButton.classList.toggle('disabled');
          startButton.classList.toggle('disabled');
        }

        const processContent = () => {
          if (contentIndex === content.length) {
            return resetPlayer();
          }
          const item = content[contentIndex];
          contentIndex += 1;
          let delay = 1;
          if (item.content) {
            const buffer = JSON.parse(atob(item.content));
            term.write(byteArrayToString(buffer.data || []))
          } else if (item.delay) {
            delay = item.delay;
          }
          timer = setTimeout(processContent, delay)
        };

        const handleStart = () => {
          contentIndex = 0;
          startButton.toggleAttribute('disabled');
          pauseButton.toggleAttribute('disabled');
          stopButton.toggleAttribute('disabled');
          startButton.classList.toggle('disabled');
          pauseButton.classList.toggle('disabled');
          stopButton.classList.toggle('disabled');
          timer = setTimeout(processContent, 1);
        };

        const handlePause = () => {
          startButton.toggleAttribute('disabled');
          pauseButton.toggleAttribute('disabled');
          startButton.classList.toggle('disabled');
          pauseButton.classList.toggle('disabled');
          clearTimeout(timer);
        };

        const handleStop = () => {
          clearTimeout(timer);
          resetPlayer();
        };
      </script>
    </body>
  </html>`;
};

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
    // eslint-disable-next-line no-undef
    const text = generateHtml({ fit: XTERM_FIT_VERSION, search: XTERM_SEARCH_VERSION, xterm: XTERM_VERSION }, buffer);
    let link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    link.setAttribute('download', 'terminalsession.html');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
