import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const confirmationType = {
  retry: 'Creating new deployment...',
  abort: 'Aborting...'
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
      <div className={`${this.state.class} ${this.props.classes || ''}`} style={{ marginRight: '12px' }}>
        <div className="bold">{this.state.loading ? confirmationType[this.props.type] : `Confirm ${this.props.type} deployment?`}</div>
        <div>
          <IconButton onClick={() => this._handleConfirm()}>
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
