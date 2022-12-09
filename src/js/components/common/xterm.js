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
