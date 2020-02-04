import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, IconButton } from '@material-ui/core';

import CopyPasteIcon from '@material-ui/icons/FileCopy';

const buttonStyle = { float: 'right', margin: '-20px 0 0 10px' };

export default class CopyCode extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { copied: false };
  }

  copied(copied) {
    var self = this;
    self.setState({ copied });
    setTimeout(() => self.setState({ copied: false }), 5000);
    if (self.props.onCopy) {
      self.props.onCopy();
    }
  }

  render() {
    const self = this;
    const { code, withDescription } = self.props;
    const { copied } = self.state;

    return (
      <>
        <div className="code">
          <CopyToClipboard text={code} onCopy={() => self.copied(true)}>
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
          <span style={{ wordBreak: 'break-word' }}>{code}</span>
        </div>
        <p>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
      </>
    );
  }
}
