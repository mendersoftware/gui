// Copyright 2021 Northern.tech AS
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
import React, { useEffect } from 'react';

import { Terminal } from 'xterm';
import { CanvasAddon } from 'xterm-addon-canvas';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';

const searchAddon = new SearchAddon();

const defaultAddons = [searchAddon];
const defaultOptions = { allowProposedApi: true, scrollback: 5000 };

export const Xterm = ({ addons, className, customKeyEventHandler, options = {}, style, xtermRef, ...remainingProps }) => {
  /**
   * XTerm.js Terminal object.
   */
  // This is assigned in the setupTerminal() which is called from the constructor
  // terminal: Terminal
  // const terminal = ref.current.terminal;

  /**
   * The ref for the containing element.
   */
  // const terminalRef = ref.current.terminalRef;

  useEffect(() => {
    // Setup the XTerm terminal.
    xtermRef.current.terminal = new Terminal({ ...defaultOptions, ...options });
    // Load addons
    defaultAddons.forEach(addon => xtermRef.current.terminal.loadAddon(addon));
    if (addons.length) {
      addons.forEach(addon => xtermRef.current.terminal.loadAddon(addon));
    }

    // Create Listeners
    Object.entries(remainingProps).map(([key, value]) => (value ? xtermRef.current.terminal[key](value) : undefined));

    // Add Custom Key Event Handler
    if (customKeyEventHandler) {
      xtermRef.current.terminal.attachCustomKeyEventHandler(customKeyEventHandler);
    }

    if (xtermRef.current.terminalRef.current) {
      // Creates the terminal within the container element.
      xtermRef.current.terminal.open(xtermRef.current.terminalRef.current);
      // we need to stick to the canvas addon, due to a lack of WebGL support in Safari
      // + to still have proper rendering performance
      xtermRef.current.terminal.loadAddon(new CanvasAddon());
    }
    return () => {
      // When the component unmounts dispose of the terminal and all of its listeners.
      xtermRef.current.terminal.dispose();
    };
  }, []);

  return <div className={className} ref={xtermRef.current.terminalRef} style={style} />;
};

export default Xterm;
