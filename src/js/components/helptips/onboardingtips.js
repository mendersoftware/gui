import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import IconButton from '@material-ui/core/IconButton';

import { ArrowUpward as ArrowUpwardIcon, Close as CloseIcon, Schedule as HelpIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { setShowConnectingDialog, setShowDismissOnboardingTipsDialog } from '../../actions/userActions';

class WelcomeSnackTipComponent extends React.PureComponent {
  onClose(_, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
  }

  render() {
    const { progress } = this.props;

    const messages = {
      1: (
        <div>
          Welcome to Mender! Follow the{' '}
          <div className="onboard-icon">
            <ArrowUpwardIcon />
          </div>{' '}
          tutorial tips on screen to:
        </div>
      ),
      2: <div>Next up</div>,
      3: <div>Next up</div>,
      4: <div>Success!</div>
    };
    return (
      <div className="onboard-snack">
        <IconButton onClick={() => this.onClose()}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className="flexbox">
          {messages[progress]}
          <ol>
            {['Connect a device', 'Deploy an Application Update', 'Create your own Release and deploy it'].map((item, index) => {
              let classNames = '';
              if (index < progress) {
                classNames = 'bold';
                if (index < progress - 1) {
                  classNames = 'completed';
                }
              }
              return (
                <li className={classNames} key={`onboarding-step-${index}`}>
                  {index + 1}. {item}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }
}

export const WelcomeSnackTip = connect(null, { setSnackbar })(WelcomeSnackTipComponent);

class DevicePendingTipComponent extends React.PureComponent {
  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }
  render() {
    const { setShowConnectingDialog, setShowDismissOnboardingTipsDialog } = this.props;
    return (
      <div className="onboard-tip" style={{ left: '50%', top: '50%' }}>
        <a
          className="tooltip onboard-icon"
          data-tip
          data-for="pending-device-onboarding-tip"
          data-event="click focus"
          data-event-off="dblclick"
          ref={ref => (this.tipRef = ref)}
        >
          <HelpIcon />
        </a>
        <ReactTooltip id="pending-device-onboarding-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
          <p>It may take a few moments before your device appears.</p>
          <a onClick={() => setShowConnectingDialog(true)}>Open the tutorial</a> again or{' '}
          <Link to="/help/application-updates/mender-deb-package">go to the help pages</Link> if you have problems.
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <a onClick={() => setShowDismissOnboardingTipsDialog(true)}>Dismiss</a>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}

const actionCreators = { setShowConnectingDialog, setShowDismissOnboardingTipsDialog, setSnackbar };

export const DevicePendingTip = connect(null, actionCreators)(DevicePendingTipComponent);
