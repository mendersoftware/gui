import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
export default class ConfirmAbort extends React.Component {
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
  _handleAbort() {
    this.setState({ loading: true });
    this.props.abort();
  }
  render() {
    return (
      <div className={this.state.class} style={{ marginRight: '12px' }}>
        <div className="float-right">
          <span className="bold">{this.state.loading ? 'Aborting...' : 'Confirm abort deployment?'}</span>
          <IconButton id="confirmAbort" onClick={() => this._handleAbort()}>
            <CheckCircleIcon className="green" />
          </IconButton>
          <IconButton id="cancelAbort" onClick={() => this._handleCancel()}>
            <CancelIcon className="red" />
          </IconButton>
        </div>
      </div>
    );
  }
}
