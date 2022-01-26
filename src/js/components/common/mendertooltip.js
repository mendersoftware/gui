import React, { useState } from 'react';

import { ClickAwayListener, Tooltip } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

export const MenderTooltip = withStyles(({ palette, shadows }) => ({
  arrow: {
    color: palette.secondary.main
  },
  tooltip: {
    backgroundColor: palette.secondary.main,
    boxShadow: shadows[1],
    color: palette.text.secondary,
    fontSize: 'small',
    maxWidth: 600,
    info: {
      maxWidth: 300,
      color: palette.text.hint,
      backgroundColor: palette.grey[500]
    }
  }
}))(Tooltip);

export const MenderTooltipClickable = ({ children, onboarding, startOpen = false, ...remainingProps }) => {
  const [open, setOpen] = useState(startOpen || false);

  const toggle = () => setOpen(!open);

  const hide = () => setOpen(false);

  const Component = onboarding ? OnboardingTooltip : MenderTooltip;
  const extraProps = onboarding
    ? {
        PopperProps: {
          disablePortal: true,
          popperOptions: {
            positionFixed: true,
            modifiers: { preventOverflow: { boundariesElement: 'window' } }
          }
        }
      }
    : {};
  return (
    <ClickAwayListener onClickAway={hide}>
      <Component
        arrow={!onboarding}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        onOpen={() => setOpen(true)}
        {...extraProps}
        {...remainingProps}
      >
        <div onClick={toggle}>{children}</div>
      </Component>
    </ClickAwayListener>
  );
};

const iconWidth = 30;

export const OnboardingTooltip = withStyles(theme => ({
  arrow: {
    color: theme.palette.primary.main
  },
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[1],
    color: theme.palette.grey[500],
    fontSize: 14,
    maxWidth: 350,
    padding: '12px 18px',
    width: 350,
    '& a': {
      color: theme.palette.grey[500]
    },
    '&.MuiTooltip-tooltipPlacementTop': { marginLeft: iconWidth, marginBottom: 0, marginTop: iconWidth + theme.spacing(1.5) },
    '&.MuiTooltip-tooltipPlacementRight': { marginTop: iconWidth / 2 },
    '&.MuiTooltip-tooltipPlacementBottom': { marginLeft: iconWidth },
    '&.MuiTooltip-tooltipPlacementLeft': { marginTop: iconWidth / 2 }
  },
  popper: {
    opacity: 0.9
  }
}))(Tooltip);
export default MenderTooltip;
