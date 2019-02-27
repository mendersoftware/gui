import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Loader from '../common/loader';

export default class ConfirmDecommission extends React.Component {
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
  _handleDecommission() {
    this.setState({ loading: true });
    this.props.decommission();
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
          <span className="bold">
            {this.state.loading
              ? 'Decommissioning '
              : 'Decommission this device and remove all of its data from the server. This cannot be undone. Are you sure?'}
          </span>

          {this.state.loading ? (
            <Loader table={true} waiting={true} show={true} style={{ height: '4px', marginLeft: '20px' }} />
          ) : (
            <div className="inline-block">
              <IconButton id="ConfirmDecommission" style={styles} onClick={() => this._handleDecommission()}>
                <FontIcon className="material-icons green">check_circle</FontIcon>
              </IconButton>
              <IconButton id="cancelDecommission" style={styles} onClick={() => this._handleCancel()}>
                <FontIcon className="material-icons red">cancel</FontIcon>
              </IconButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}
