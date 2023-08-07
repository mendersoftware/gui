// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

import { TIMEOUTS } from '../../../constants/appConstants';
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

export const Terminal = ({ onDownloadClick, sendMessage, setSnackbar, socketInitialized, textInput, xtermRef, ...xtermProps }) => {
  const [dimensions, setDimensions] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const size = useWindowSize();

  const observer = useMemo(() => new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting)), []);
  const addons = useMemo(() => [fitAddon], []);

  const tryFit = useCallback(() => {
    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', TIMEOUTS.fiveSeconds);
    }
  }, [setSnackbar]);

  useEffect(() => {
    if (!socketInitialized) {
      return;
    }
    observer.observe(xtermRef.current.terminalRef.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [observer, sendMessage, socketInitialized, xtermRef]);

  useEffect(() => {
    if (!socketInitialized || !xtermRef.current?.terminal?.current) {
      return;
    }
    xtermRef.current.terminal.current.reset();
    const webLinksAddon = new WebLinksAddon((e, link) => onDownloadClick(link), { urlRegex: unixPathRegex }, true);
    xtermRef.current.terminal.current.loadAddon(webLinksAddon);
    tryFit();
    const { rows = 40, cols = 80 } = fitAddon.proposeDimensions() || {};
    sendMessage({ typ: MessageTypes.Resize, props: { terminal_height: rows, terminal_width: cols } });
    setDimensions({ rows, cols });
    xtermRef.current.terminal.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDownloadClick, socketInitialized, tryFit, sendMessage]);

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
  }, [size, isVisible, socketInitialized, xtermRef, dimensions.rows, dimensions.cols, sendMessage]);

  useEffect(() => {
    if (!socketInitialized || !xtermRef.current.terminal || !textInput) {
      return;
    }
    xtermRef.current.terminal.current.paste(textInput);
  }, [socketInitialized, textInput, xtermRef]);

  const onData = useCallback(data => sendMessage({ typ: MessageTypes.Shell, body: data }), [sendMessage]);

  return <XTerm xtermRef={xtermRef} addons={addons} options={options} onData={onData} {...xtermProps} />;
};

export default Terminal;
