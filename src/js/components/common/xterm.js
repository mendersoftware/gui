import React from 'react';

import 'xterm/css/xterm.css';

import { Terminal } from 'xterm';

export default class Xterm extends React.Component {
  /**
   * XTerm.js Terminal object.
   */
  // This is assigned in the setupTerminal() which is called from the constructor
  // terminal: Terminal

  constructor(props) {
    super(props);

    /**
     * The ref for the containing element.
     */
    this.terminalRef = React.createRef();

    this.setupTerminal();
  }

  setupTerminal() {
    const self = this;
    // eslint-disable-next-line no-unused-vars
    const { addons, className, customKeyEventHandler, options, style, ...remainingProps } = self.props;
    // Setup the XTerm terminal.
    self.terminal = new Terminal(options);
    // Load addons if the prop exists.
    if (addons) {
      addons.forEach(addon => this.terminal.loadAddon(addon));
    }

    // Create Listeners
    Object.entries(remainingProps).map(([key, value]) => (value ? self.terminal[key](value) : undefined));

    // Add Custom Key Event Handler
    if (customKeyEventHandler) {
      self.terminal.attachCustomKeyEventHandler(customKeyEventHandler);
    }
  }

  componentDidMount() {
    if (this.terminalRef.current) {
      // Creates the terminal within the container element.
      this.terminal.open(this.terminalRef.current);
    }
  }

  componentWillUnmount() {
    // When the component unmounts dispose of the terminal and all of its listeners.
    this.terminal.dispose();
  }

  render() {
    return <div className={this.props.className} ref={this.terminalRef} style={this.props.style} />;
  }
}
