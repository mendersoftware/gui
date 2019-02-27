import React from 'react';

import AppActions from '../../actions/app-actions';
import Snackbar from 'material-ui/Snackbar';
import copy from 'copy-to-clipboard';

export default class SharedSnackbar extends React.Component {
  handleActionClick() {
    copy(this.props.snackbar.message);
    AppActions.setSnackbar('Copied to clipboard');
  }

  handleRequestClose() {
    AppActions.setSnackbar('');
  }

  render() {
    return (
      <Snackbar
        open={this.props.snackbar.open}
        message={this.props.snackbar.message}
        autoHideDuration={this.props.snackbar.autoHideDuration}
        action={this.props.snackbar.action}
        bodyStyle={{ maxWidth: this.props.snackbar.maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
        onClick={() => this.handleActionClick()}
        onRequestClose={() => this.handleRequestClose()}
      />
    );
  }
}
