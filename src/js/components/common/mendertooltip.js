// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';

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

export const MenderTooltipClickable = ({ children, onboarding, startOpen = false, visibility = startOpen, onOpenChange, ...remainingProps }) => {
  const [open, setOpen] = useState(startOpen || false);

  useEffect(() => {
    setOpen(visibility);
  }, [visibility]);

  useEffect(() => {
    onOpenChange(open);
  }, [open]);

  const toggleVisibility = () => setOpen(toggle);

  const hide = () => setOpen(false);

  const Component = onboarding ? OnboardingTooltip : MenderTooltip;
  const extraProps = onboarding
    ? {
        PopperProps: {
          disablePortal: true,
          popperOptions: {
            strategy: 'fixed',
            modifiers: [
              { name: 'flip', enabled: false },
              { name: 'preventOverflow', enabled: true, options: { boundary: window, altBoundary: false } }
            ]
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
        <div onClick={toggleVisibility}>{children}</div>
      </Component>
    </ClickAwayListener>
  );
};

const iconWidth = 30;

export const OnboardingTooltip = withStyles(Tooltip, theme => ({
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
    '&.MuiTooltip-tooltipPlacementTop': { marginLeft: iconWidth, marginBottom: 0, marginTop: `calc(${iconWidth} + ${theme.spacing(1.5)})` },
    '&.MuiTooltip-tooltipPlacementRight': { marginTop: iconWidth / 2 },
    '&.MuiTooltip-tooltipPlacementBottom': { marginLeft: iconWidth },
    '&.MuiTooltip-tooltipPlacementLeft': { marginTop: iconWidth / 2 }
  },
  popper: {
    opacity: 0.9
  }
}));
export default MenderTooltip;
