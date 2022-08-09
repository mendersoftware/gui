import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, IconButton } from '@mui/material';

import CopyPasteIcon from '@mui/icons-material/FileCopy';
import { makeStyles } from 'tss-react/mui';

const buttonStyle = { float: 'right', margin: '-20px 0 0 10px' };

const useStyles = makeStyles()(theme => ({
  code: {
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[400],
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[400]
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
    setTimeout(() => setCopied(false), 5000);
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
