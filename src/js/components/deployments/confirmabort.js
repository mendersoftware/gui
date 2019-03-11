import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

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
            <Icon className="material-icons green">check_circle</Icon>
          </IconButton>
          <IconButton id="cancelAbort" onClick={() => this._handleCancel()}>
            <Icon className="material-icons red">cancel</Icon>
          </IconButton>
        </div>
      </div>
    );
  }
}
