import React from 'react';

import AppActions from '../../actions/app-actions';
import Snackbar from '@material-ui/core/Snackbar';
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
    const { maxWidth, onClick, ...snackProps } = this.props.snackbar;
    return (
      <Snackbar
        style={{ maxWidth: maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
        onClick={onClick ? onClick : () => this.handleActionClick()}
        onClose={() => this.handleRequestClose()}
        {...snackProps}
      />
    );
  }
}
