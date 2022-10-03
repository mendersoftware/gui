import React, { useCallback, useEffect, useState } from 'react';

import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

import { DEVICE_MESSAGE_TYPES as MessageTypes } from '../../../constants/deviceConstants';
import useWindowSize from '../../../utils/resizehook';
import XTerm from '../../common/xterm';

const fitAddon = new FitAddon();

export const options = {
  cursorBlink: 'block',
  macOptionIsMeta: true
};

// only matching absolute paths, so: /here/there - but not ../here or ./here or here/there
const unixPathRegex = new RegExp('(\\/([^\\0\\s!$`&*()\\[\\]+\'":;\\\\])+)');

export const Terminal = ({ onDownloadClick, sendMessage, sessionId, setSnackbar, socketInitialized, textInput, xtermRef, ...xtermProps }) => {
  const [dimensions, setDimensions] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const size = useWindowSize();

  const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));

  const tryFit = useCallback(() => {
    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', 5000);
    }
  }, [fitAddon, setSnackbar]);

  useEffect(() => {
    if (!socketInitialized) {
      return;
    }
    observer.observe(xtermRef.current.terminalRef.current);
    tryFit();
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [socketInitialized, tryFit]);

  useEffect(() => {
    if (!socketInitialized || !xtermRef.current?.terminal || sessionId) {
      return;
    }
    xtermRef.current.terminal.reset();
    const webLinksAddon = new WebLinksAddon((e, link) => onDownloadClick(link), { urlRegex: unixPathRegex }, true);
    xtermRef.current.terminal.loadAddon(webLinksAddon);
    tryFit();
    const { rows = 40, cols = 80 } = fitAddon.proposeDimensions() || {};
    sendMessage({ typ: MessageTypes.New, props: { terminal_height: rows, terminal_width: cols } });
    setDimensions({ rows, cols });
    xtermRef.current.terminal.focus();
  }, [socketInitialized, tryFit, xtermRef.current]);

  useEffect(() => {
    if (!socketInitialized || !xtermRef.current.terminal || !isVisible) {
      return;
    }
    fitAddon.fit();
    const newDimensions = fitAddon.proposeDimensions();
    if (newDimensions.rows != dimensions.rows || newDimensions.cols != dimensions.cols) {
      //
      sendMessage({
        typ: MessageTypes.Resize,
        props: { terminal_height: newDimensions.rows, terminal_width: newDimensions.cols }
      });
      setDimensions(newDimensions);
    }
  }, [size, isVisible]);

  useEffect(() => {
    if (!socketInitialized || !xtermRef.current.terminal || !textInput) {
      return;
    }
    xtermRef.current.terminal.paste(textInput);
  }, [socketInitialized, xtermRef.current, textInput]);

  const onData = data => sendMessage({ typ: MessageTypes.Shell, body: data });

  return <XTerm xtermRef={xtermRef} addons={[fitAddon]} options={options} onData={onData} {...xtermProps} />;
};

export default Terminal;
