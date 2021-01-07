import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, IconButton } from '@material-ui/core';

import CopyPasteIcon from '@material-ui/icons/FileCopy';

const buttonStyle = { float: 'right', margin: '-20px 0 0 10px' };

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
      <div className="code">
        <CopyToClipboard text={code} onCopy={onCopied}>
          {withDescription ? (
            <Button style={buttonStyle} startIcon={<CopyPasteIcon />}>
              Copy to clipboard
            </Button>
          ) : (
            <IconButton style={buttonStyle}>
              <CopyPasteIcon />
            </IconButton>
          )}
        </CopyToClipboard>
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</span>
      </div>
      <p>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
    </>
  );
};

export default CopyCode;
