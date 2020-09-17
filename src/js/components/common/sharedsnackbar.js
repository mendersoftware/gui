import React from 'react';
import { connect } from 'react-redux';

import { setSnackbar } from '../../actions/appActions';
import Snackbar from '@material-ui/core/Snackbar';
import copy from 'copy-to-clipboard';

export const SharedSnackbar = ({ setSnackbar, snackbar }) => {
  const handleActionClick = () => {
    copy(snackbar.message);
    setSnackbar('Copied to clipboard');
  };

  const onCloseSnackbar = (_, reason) => {
    const { onClose = false } = snackbar;
    if (onClose && reason === 'clickaway') {
      return;
    }
    setSnackbar('');
  };

  const { maxWidth, onClick, ...snackProps } = snackbar;
  return (
    <Snackbar
      {...snackProps}
      style={{ maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
      onClick={onClick ? onClick : handleActionClick}
      onClose={onCloseSnackbar}
    />
  );
};

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    snackbar: state.app.snackbar
  };
};

export default connect(mapStateToProps, actionCreators)(SharedSnackbar);
