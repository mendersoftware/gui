import React, { memo } from 'react';
import { Snackbar } from '@mui/material';
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

  const { maxWidth, onClick = handleActionClick, ...snackProps } = snackbar;
  return (
    <Snackbar
      {...snackProps}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      style={{ maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
      onClick={onClick}
      onClose={onCloseSnackbar}
    />
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.snackbar.open != nextProps.snackbar.open || prevProps.snackbar.message != nextProps.snackbar.message) {
    return false;
  }
  return prevProps.snackbar.children != nextProps.snackbar.children;
};

export default memo(SharedSnackbar, areEqual);
