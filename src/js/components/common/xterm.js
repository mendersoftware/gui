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

    // Bind Methods
    this.onData = this.onData.bind(this);

    this.setupTerminal();
  }

  setupTerminal() {
    // Setup the XTerm terminal.
    this.terminal = new Terminal(this.props.options);

    // Load addons if the prop exists.
    if (this.props.addons) {
      this.props.addons.forEach(addon => {
        this.terminal.loadAddon(addon);
      });
    }

    // Create Listeners
    this.terminal.onData(this.onData);

    // Add Custom Key Event Handler
    if (this.props.customKeyEventHandler) {
      this.terminal.attachCustomKeyEventHandler(this.props.customKeyEventHandler);
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

  onData(data) {
    if (this.props.onData) this.props.onData(data);
  }

  render() {
    return <div className={this.props.className} ref={this.terminalRef} />;
  }
}
