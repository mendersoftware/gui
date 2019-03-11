import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
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
              <IconButton id="ConfirmDecommission" onClick={() => this._handleDecommission()}>
                <Icon className="material-icons green">check_circle</Icon>
              </IconButton>
              <IconButton id="cancelDecommission" onClick={() => this._handleCancel()}>
                <Icon className="material-icons red">cancel</Icon>
              </IconButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}
