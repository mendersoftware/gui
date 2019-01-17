import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

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
    var styles = {
      padding: '0',
      marginLeft: '12px',
      marginRight: '-24px',
      verticalAlign: 'middle'
    };
    return (
      <div className={this.state.class} style={{ marginRight: '12px' }}>
        <div className="float-right">
          <span className="bold">{this.state.loading ? 'Aborting...' : 'Confirm abort deployment?'}</span>
          <IconButton id="confirmAbort" style={styles} onClick={() => this._handleAbort()}>
            <FontIcon className="material-icons green">check_circle</FontIcon>
          </IconButton>
          <IconButton id="cancelAbort" style={styles} onClick={() => this._handleCancel()}>
            <FontIcon className="material-icons red">cancel</FontIcon>
          </IconButton>
        </div>
      </div>
    );
  }
}
