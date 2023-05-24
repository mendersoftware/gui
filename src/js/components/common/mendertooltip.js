import React, { useState } from 'react';

import { ClickAwayListener, Tooltip } from '@mui/material';
import { withStyles } from 'tss-react/mui';

import { toggle } from '../../helpers';

export const MenderTooltip = withStyles(Tooltip, ({ palette, shadows }) => ({
  arrow: {
    color: palette.secondary.main
  },
  tooltip: {
    backgroundColor: palette.secondary.main,
    boxShadow: shadows[1],
    color: palette.tooltip.text,
    fontSize: 'small',
    maxWidth: 600,
    info: {
      maxWidth: 300,
      color: palette.text.hint,
      backgroundColor: palette.grey[500]
    }
  }
}));

export const MenderTooltipClickable = ({ children, startOpen = false, ...remainingProps }) => {
  const [open, setOpen] = useState(startOpen || false);

  const toggleVisibility = () => setOpen(toggle);

  const hide = () => setOpen(false);

  return (
    <ClickAwayListener onClickAway={hide}>
      <MenderTooltip arrow open={open} disableFocusListener disableHoverListener disableTouchListener onOpen={() => setOpen(true)} {...remainingProps}>
        <div onClick={toggleVisibility}>{children}</div>
      </MenderTooltip>
    </ClickAwayListener>
  );
};

export default MenderTooltip;
