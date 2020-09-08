import React from 'react';
import { connect } from 'react-redux';

import { setSnackbar } from '../../actions/appActions';
import Snackbar from '@material-ui/core/Snackbar';
import copy from 'copy-to-clipboard';

export class SharedSnackbar extends React.PureComponent {
  handleActionClick() {
    copy(this.props.snackbar.message);
    this.props.setSnackbar('Copied to clipboard');
  }

  onCloseSnackbar = (_, reason) => {
    const {
      setSnackbar,
      snackbar: { onClose = false }
    } = this.props;
    if (onClose && reason === 'clickaway') {
      return;
    }
    setSnackbar('');
  };

  render() {
    const { maxWidth, onClick, ...snackProps } = this.props.snackbar;
    return (
      <Snackbar
        style={{ maxWidth: maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
        onClick={onClick ? onClick : () => this.handleActionClick()}
        onClose={this.onCloseSnackbar}
        {...snackProps}
      />
    );
  }
}

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    snackbar: state.app.snackbar
  };
};

export default connect(mapStateToProps, actionCreators)(SharedSnackbar);
