import React from 'react';

// material ui
import { Divider, ListItem, ListItemText, Tooltip } from '@material-ui/core';

import { FileCopyOutlined as CopyToClipboardIcon } from '@material-ui/icons';

import copy from 'copy-to-clipboard';

export default class ExpandableAttribute extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expanded: false,
      overflowActive: false,
      tooltipVisible: false
    };
  }

  componentDidUpdate() {
    const self = this;
    if (self.textContent) {
      const overflowActive = self.textContent.scrollWidth > self.textContent.clientWidth || self.textContent.scrollHeight > self.textContent.clientHeight;
      if (self.state.overflowActive !== overflowActive && !self.state.expanded) {
        self.setState({ overflowActive });
      }
    }
  }

  render() {
    const self = this;
    const { classes, copyToClipboard, dividerDisabled, primary, secondary, secondaryTypographyProps = {}, setSnackbar, style, textClasses } = self.props;
    const defaultClasses = { root: 'attributes' };
    const currentTextClasses = `${textClasses ? textClasses.secondary : 'inventory-text'}${
      self.state.expanded && self.state.overflowActive ? ' expanded-attribute' : ''
    }`;
    const secondaryText = (
      <div>
        <span className={currentTextClasses} ref={r => (self.textContent = r)} style={self.state.overflowActive ? { marginBottom: '-0.5em' } : {}}>
          {secondary}
        </span>{' '}
        {self.state.overflowActive ? <a>show {self.state.expanded ? 'less' : 'more'}</a> : null}
      </div>
    );

    const onClick = () => {
      if (copyToClipboard) {
        // Date/Time components
        if (secondary.props && secondary.props.value) {
          copy(secondary.props.value);
        } else {
          copy(secondary);
        }
        setSnackbar('Value copied to clipboard');
      }
      self.setState({ expanded: !self.state.expanded });
    };

    var cssClasses = classes || defaultClasses;
    if (copyToClipboard) {
      cssClasses.root = (cssClasses.root + ' copy-to-clipboard').trim();
    }

    return (
      <div
        onClick={onClick}
        onMouseEnter={() => this.setState({ 'tooltipVisible': true })}
        onMouseLeave={() => this.setState({ 'tooltipVisible': false })}
        style={style}
      >
        <ListItem classes={cssClasses} disabled={true}>
          <ListItemText
            primary={primary}
            secondary={secondaryText}
            secondaryTypographyProps={{ title: secondary, component: 'div', ...secondaryTypographyProps }}
          />
          {copyToClipboard ? (
            <Tooltip title={'Copy to clipboard'} placement="top" open={this.state.tooltipVisible}>
              <CopyToClipboardIcon fontSize="small"></CopyToClipboardIcon>
            </Tooltip>
          ) : null}
        </ListItem>
        {dividerDisabled ? null : <Divider />}
      </div>
    );
  }
}
