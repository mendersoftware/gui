import React from 'react';

import Tracking from './tracking';

export default class ErrorBoundary extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    Tracking.exception(error);
  }

  render() {
    return this.state.error ? (
      // this will get embedded in the main grid, so we have to simulate the three empty areas for logo, header and sidebar
      <>
        <div />
        <div />
        <div />
        <div className="flexbox centered">
          <div>
            <h2>An error occured.</h2>
            <p>Try refreshing the page, or look below for more information on the error that occured.</p>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error.toString()}
              <br />
              {this.state.info.componentStack}
            </details>
          </div>
        </div>
      </>
    ) : (
      this.props.children
    );
  }
}
