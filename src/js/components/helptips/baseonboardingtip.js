import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import {
  ArrowBack as ArrowBackIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';

import { bindActionCreators } from 'redux';

import { setShowDismissOnboardingTipsDialog } from '../../actions/onboardingActions';
import { toggle } from '../../helpers';
import Tracking from '../../tracking';
import { OnboardingTooltip } from '../common/mendertooltip';

const iconWidth = 30;

export const orientations = {
  top: {
    arrow: <ArrowUpwardIcon />,
    placement: 'bottom',
    offsetStyle: style => {
      style.left = style.left - iconWidth / 2;
      return style;
    }
  },
  right: {
    arrow: <ArrowBackIcon />,
    placement: 'right',
    offsetStyle: style => {
      style.top = style.top - iconWidth / 2;
      style.left = style.left + iconWidth / 2;
      return style;
    }
  },
  bottom: {
    arrow: <ArrowDownwardIcon />,
    placement: 'top',
    offsetStyle: style => {
      style.left = style.left - iconWidth / 2;
      return style;
    }
  },
  left: {
    arrow: <ArrowForwardIcon />,
    placement: 'left',
    offsetStyle: style => {
      style.top = style.top - iconWidth / 2;
      return style;
    }
  }
};

export const OnboardingIndicator = React.forwardRef(({ className = '', orientation: { arrow, placement }, style = {}, toggle, ...props }, ref) => (
  <div className={className} onClick={toggle} ref={ref} style={style} {...props}>
    <div className={`tooltip onboard-icon ${placement}`}>{arrow}</div>
  </div>
));
OnboardingIndicator.displayName = 'OnboardingIndicator';

const BaseOnboardingTipComponent = ({
  anchor,
  component,
  place = 'top',
  progress,
  progressTotal = 3,
  id = '1',
  setShowDismissOnboardingTipsDialog,
  ...others
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    Tracking.event({ category: 'onboarding', action: id });
    setOpen(true);
  }, []);

  const toggleVisibility = () => setOpen(toggle);

  const hide = () => setOpen(false);

  const orientation = orientations[place];
  const style = orientation.offsetStyle({ left: anchor.left, top: anchor.top, overflow: 'initial' });

  return (
    <OnboardingTooltip
      disableFocusListener
      disableHoverListener
      disableTouchListener
      id={id}
      onClose={hide}
      open={open}
      placement={orientation.placement}
      PopperProps={{
        disablePortal: true,
        popperOptions: {
          strategy: 'fixed',
          modifiers: [
            { name: 'flip', enabled: false },
            { name: 'preventOverflow', enabled: true, options: { boundary: window, altBoundary: false } }
          ]
        }
      }}
      title={
        <div className="content">
          {React.cloneElement(component, others)}
          <div className="flexbox">
            {progress ? <div>{`Progress: step ${progress} of ${progressTotal}`}</div> : null}
            <div style={{ flexGrow: 1 }} />
            <a onClick={() => setShowDismissOnboardingTipsDialog(true)}>Dismiss</a>
          </div>
        </div>
      }
    >
      <OnboardingIndicator className="onboard-tip" orientation={orientation} style={style} toggle={toggleVisibility} />
    </OnboardingTooltip>
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setShowDismissOnboardingTipsDialog }, dispatch);
};

export const BaseOnboardingTip = connect(null, mapDispatchToProps)(BaseOnboardingTipComponent);
export default BaseOnboardingTip;
