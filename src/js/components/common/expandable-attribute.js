import React, { useEffect, useRef, useState } from 'react';

// material ui
import { FileCopyOutlined as CopyToClipboardIcon } from '@mui/icons-material';
import { ListItem, ListItemText, Tooltip } from '@mui/material';

import copy from 'copy-to-clipboard';

import { toggle } from '../../helpers';

const defaultClasses = { root: 'attributes' };

export const ExpandableAttribute = ({
  className = '',
  component = 'li',
  copyToClipboard,
  disableGutters,
  dividerDisabled,
  primary,
  secondary,
  secondaryTypographyProps = {},
  setSnackbar,
  style,
  textClasses
}) => {
  const textContent = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowActive, setOverflowActive] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    if (textContent.current) {
      const overflowActiveCurrently =
        textContent.current.scrollWidth > textContent.current.clientWidth || textContent.current.scrollHeight > textContent.current.clientHeight;
      if (overflowActive !== overflowActiveCurrently && !expanded) {
        setOverflowActive(overflowActiveCurrently);
      }
    }
  }, [textContent]);

  const onClick = () => {
    if (copyToClipboard) {
      // Date/Time components
      if (secondary.props?.value) {
        copy(secondary.props.value);
      } else {
        copy(secondary);
      }
      setSnackbar('Value copied to clipboard');
    }
    setExpanded(toggle);
  };

  const currentTextClasses = `${textClasses ? textClasses.secondary : 'inventory-text'}${expanded && overflowActive ? ' expanded-attribute' : ''}`;
  const secondaryText = (
    <>
      <span className={currentTextClasses} ref={textContent}>
        {secondary}
      </span>{' '}
      {overflowActive ? <a>show {expanded ? 'less' : 'more'}</a> : null}
    </>
  );

  const cssClasses = { ...defaultClasses, root: `${defaultClasses.root} ${copyToClipboard ? 'copy-to-clipboard' : ''}`.trim() };

  return (
    <div className={className} onClick={onClick} onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} style={style}>
      <ListItem classes={cssClasses} disableGutters={disableGutters} divider={!dividerDisabled} component={component}>
        <ListItemText
          primary={primary}
          secondary={secondaryText}
          secondaryTypographyProps={{ title: secondary, component: 'div', ...secondaryTypographyProps }}
        />
        {copyToClipboard ? (
          <Tooltip title={'Copy to clipboard'} placement="top" open={tooltipVisible}>
            <CopyToClipboardIcon fontSize="small" />
          </Tooltip>
        ) : null}
      </ListItem>
    </div>
  );
};

export default ExpandableAttribute;
