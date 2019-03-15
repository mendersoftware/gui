import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export default class ConfirmRetry extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      class: 'fadeIn'
    };
  }
  _handleCancel() {
    this.setState({ class: 'fadeOut' });
    this.props.cancel();
  }
  _handleRetry() {
    this.setState({ loading: true });
    this.props.retry();
  }
  render() {
    return (
      <div className={this.state.class} style={{ marginRight: '12px' }}>
        <div className="float-right">
          <span className="bold">{this.state.loading ? 'Creating new deployment...' : 'Confirm retry deployment?'}</span>
          <IconButton id="confirmRetry" onClick={() => this._handleRetry()}>
            <CheckCircleIcon className="green" />
          </IconButton>
          <IconButton id="cancelRetry" onClick={() => this._handleCancel()}>
            <CancelIcon className="red" />
          </IconButton>
        </div>
      </div>
    );
  }
}
