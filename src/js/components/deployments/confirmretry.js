import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

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
            <Icon className="material-icons green">check_circle</Icon>
          </IconButton>
          <IconButton id="cancelRetry" onClick={() => this._handleCancel()}>
            <Icon className="material-icons red">cancel</Icon>
          </IconButton>
        </div>
      </div>
    );
  }
}
