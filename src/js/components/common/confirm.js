import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const confirmationType = {
  retry: {
    loading: 'Creating new deployment...',
    message: 'Confirm retry deployment?'
  },
  abort: {
    loading: 'Aborting...',
    message: 'Confirm abort deployment?'
  },
  chartRemoval: {
    loading: 'Removing...',
    message: 'Remove this chart?'
  }
};

export default class Confirm extends React.Component {
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
  _handleConfirm() {
    this.setState({ loading: true });
    this.props.action();
  }
  render() {
    return (
      <div className={`${this.state.class} ${this.props.classes || ''}`} style={{ marginRight: '12px', ...this.props.style }}>
        <div className="float-right">
          <span className="bold">{this.state.loading ? confirmationType[this.props.type].loading : confirmationType[this.props.type].message}</span>
          <IconButton id="confirmAbort" onClick={() => this._handleConfirm()}>
            <CheckCircleIcon className="green" />
          </IconButton>
          <IconButton onClick={() => this._handleCancel()}>
            <CancelIcon className="red" />
          </IconButton>
        </div>
      </div>
    );
  }
}
