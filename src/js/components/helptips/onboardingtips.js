import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import IconButton from '@material-ui/core/IconButton';

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Schedule';

import AppActions from '../../actions/app-actions';

export class WelcomeSnackTip extends React.PureComponent {
  onClose(_, reason) {
    if (reason === 'clickaway') {
      return;
    }
    AppActions.setSnackbar('');
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

export class DevicePendingTip extends React.Component {
  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }
  render() {
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
          <a onClick={() => AppActions.setShowConnectingDialog(true)}>Open the tutorial</a> again or{' '}
          <Link to="/help/application-updates/mender-deb-package">go to the help pages</Link> if you have problems.
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <a onClick={() => AppActions.setShowDismissOnboardingTipsDialog(true)}>Dismiss</a>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
