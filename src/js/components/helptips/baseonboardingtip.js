import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { setShowDismissOnboardingTipsDialog } from '../../actions/userActions';

const iconWidth = 30;

const orientations = {
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

export class BaseOnboardingTip extends React.PureComponent {
  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }
  show() {
    ReactTooltip.show(this.tipRef);
  }
  hide() {
    ReactTooltip.hide(this.tipRef);
  }
  render() {
    const { anchor, component, place, progress, progressTotal, id, setShowDismissOnboardingTipsDialog, ...others } = this.props;
    const orientation = orientations[place || 'top'];
    const style = orientation.offsetStyle({ left: anchor.left, top: anchor.top });
    const tipId = `onboard-tip-${id ? id : 1}`;
    return (
      <div className="onboard-tip" style={style}>
        <a
          className={`tooltip onboard-icon ${orientation.placement}`}
          data-tip
          data-for={tipId}
          data-event="click focus"
          data-event-off="dblclick"
          ref={ref => (this.tipRef = ref)}
        >
          {orientation.arrow}
        </a>
        <ReactTooltip
          id={tipId}
          place={orientation.placement}
          type="light"
          effect="solid"
          className={`content ${orientation.placement}`}
          clickable={true}
          style={orientation.contentStyle}
        >
          {React.cloneElement(component, others)}
          <div className="flexbox">
            {progress ? <div>{`Progress: step ${progress} of ${progressTotal || 3}`}</div> : null}
            <div style={{ flexGrow: 1 }} />
            <a onClick={() => setShowDismissOnboardingTipsDialog(true)}>Dismiss</a>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}

const actionCreators = { setShowDismissOnboardingTipsDialog };

export default connect(null, actionCreators)(BaseOnboardingTip);
