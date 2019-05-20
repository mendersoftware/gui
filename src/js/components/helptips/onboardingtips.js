import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import HelpIcon from '@material-ui/icons/Schedule';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import AppActions from '../../actions/app-actions';

export class WelcomeSnackTip extends React.PureComponent {
  render() {
    const { progress } = this.props;
    return (
      <div className="onboard-snack">
        Welcome to Mender! Follow the{' '}
        <div className="onboard-icon">
          <ArrowUpwardIcon />
        </div>{' '}
        tutorial tips on screen to:
        <ol>
          {['Connect a device', 'Deploy an Application Update', 'Create your own Release and deploy it'].map((item, index) => (
            <li className={index < progress ? 'bold' : ''} key={`onboarding-step-${index}`}>
              {item}
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

export class DeploymentCompleteTip extends React.Component {
  onClose() {
    AppActions.setShowHelptips(false);
    AppActions.setOnboardingComplete(false);
  }
  onClick() {
    AppActions.setOnboardingComplete(false);
    this.onClose();
  }

  render() {
    return (
      <div>
        <p>Fantastic! You completed your first deployment!</p>
        <p>Your deployment is finished and your device is now running the updated software!</p>
        <div className="flexbox centered">
          <Button variant="contained" onClick={() => this.onClick()}>{`Go to ${this.props.targetUrl}`}</Button>
        </div>
        <p>and you should see the demo web application actually being run on the device.</p>
        <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
        <a href={this.props.targetUrl}>Visit the web app running your device</a>
      </div>
    );
  }
}

export class OnboardingCompleteTip extends React.Component {
  componentDidMount() {
    AppActions.setOnboardingComplete(true);
  }
  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }
  onClose() {
    AppActions.setShowHelptips(false);
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
          <CheckCircleIcon />
        </a>
        <ReactTooltip id="pending-device-onboarding-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
          <p>Great work! You updated your device with the new Release!</p>
          <p>
            Your device is now running the updated version of the software. At <a href={this.props.targetUrl}>{this.props.targetUrl}</a> you should see
            &apos;hello world&apos; in place of the webpage you saw previously.
          </p>
          <p>You&apos;ve now got a good foundation in how to use Mender. Look for more help hints in the UI as you go along.</p>
          What next?
          <div>
            <a>Learn about full-image updates</a> or <a>how to create other kinds of application updates.</a>
          </div>
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => this.props.onClose()}>
              Close
            </Button>
          </div>
        </ReactTooltip>
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
          <Link to="/help/connecting-devices">go to the help pages</Link> if you have problems.
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <a onClick={() => AppActions.setShowDismissOnboardingTipsDialog(true)}>Dismiss</a>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
