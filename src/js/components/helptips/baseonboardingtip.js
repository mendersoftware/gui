import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@material-ui/icons';

import { setShowDismissOnboardingTipsDialog } from '../../actions/onboardingActions';

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

export const OnboardingIndicator = React.forwardRef(({ className = '', orientation, style = {}, toggle }, ref) => {
  const { arrow, placement } = orientation;

  return (
    <div className={className} onClick={toggle} ref={ref} style={style}>
      <div className={`tooltip onboard-icon ${placement}`}>{arrow}</div>
    </div>
  );
});
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

  const toggle = () => setOpen(!open);

  const hide = () => setOpen(false);

  const orientation = orientations[place];
  const style = orientation.offsetStyle({ left: anchor.left, top: anchor.top, overflow: 'initial' });

  return (
    <OnboardingTooltip
      disableFocusListener
      disableHoverListener
      disableTouchListener
      id={id}
      interactive
      onClose={hide}
      open={open}
      placement={orientation.placement}
      PopperProps={{
        disablePortal: true,
        popperOptions: {
          positionFixed: true,
          modifiers: { preventOverflow: { boundariesElement: 'window' } }
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
      <OnboardingIndicator className="onboard-tip" orientation={orientation} style={style} toggle={toggle} />
    </OnboardingTooltip>
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setShowDismissOnboardingTipsDialog }, dispatch);
};

export const BaseOnboardingTip = connect(null, mapDispatchToProps)(BaseOnboardingTipComponent);
export default BaseOnboardingTip;
