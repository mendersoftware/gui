import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, IconButton } from '@mui/material';
import { FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { TIMEOUTS } from '../../constants/appConstants';

const buttonStyle = { float: 'right', margin: '-20px 0 0 10px' };

const useStyles = makeStyles()(theme => ({
  code: {
    border: '1px solid',
    borderColor: theme.palette.background.lightgrey,
    backgroundColor: theme.palette.background.lightgrey
  }
}));

export const Code = ({ className = '', children, style = {} }) => {
  const { classes } = useStyles();
  return (
    <div className={`code ${classes.code} ${className}`} style={style}>
      {children}
    </div>
  );
};

export const CopyCode = ({ code, onCopy, withDescription }) => {
  const [copied, setCopied] = useState(false);

  const onCopied = (_text, result) => {
    setCopied(result);
    setTimeout(() => setCopied(false), TIMEOUTS.fiveSeconds);
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <>
      <Code>
        <CopyToClipboard text={code} onCopy={onCopied}>
          {withDescription ? (
            <Button style={buttonStyle} startIcon={<CopyPasteIcon />}>
              Copy to clipboard
            </Button>
          ) : (
            <IconButton style={buttonStyle} size="large">
              <CopyPasteIcon />
            </IconButton>
          )}
        </CopyToClipboard>
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</span>
      </Code>
      <p>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
    </>
  );
};

export default CopyCode;
