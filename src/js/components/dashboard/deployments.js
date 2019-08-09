import React from 'react';
import pluralize from 'pluralize';

import RefreshIcon from '@material-ui/icons/Refresh';
import UpdateIcon from '@material-ui/icons/Update';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Loader from '../common/loader';

import { BaseWidget } from './widgets/baseWidget';
import RedirectionWidget from './widgets/redirectionwidget';
import CompletedDeployments from './widgets/completeddeployments';

const refreshDeploymentsLength = 30000;

export default class Deployments extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    const lastDeploymentCheck = self.updateDeploymentCutoff(new Date());
    self.state = {
      deployments: [],
      finished: [],
      inprogress: [],
      lastDeploymentCheck,
      loading: true,
      pending: []
    };
  }
  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
    clearInterval(this.timer);
    clearAllRetryTimers();
  }
  componentDidMount() {
    var self = this;
    AppStore.changeListener(this._onChange.bind(this));
    clearAllRetryTimers();
    self.timer = setInterval(() => self.getDeployments(), refreshDeploymentsLength);
    self.getDeployments();
  }

  _onChange() {
    const deployments = AppStore.getDeployments();
    const deploymentsByState = deployments.reduce(
      (accu, item) => {
        accu[item.status].push(item);
        return accu;
      },
      { inprogress: [], pending: [], finished: [], deployments }
    );
    this.setState(deploymentsByState);
  }
  handleDeploymentError(err) {
    var errormsg = err.error || 'Please check your connection';
    setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength);
  }
  getDeployments() {
    const self = this;
    return AppActions.getDeployments(1, 20)
      .then(() => self.setState({ loading: false }))
      .catch(self.handleDeploymentError);
  }
  updateDeploymentCutoff(today) {
    const jsonContent = window.localStorage.getItem('deploymentChecker');
    let lastCheck = today;
    try {
      lastCheck = jsonContent ? new Date(JSON.parse(jsonContent)) : today;
    } catch (error) {
      console.warn(error);
    }
    if (!window.sessionStorage.length) {
      window.localStorage.setItem('deploymentChecker', JSON.stringify(today));
      window.sessionStorage.setItem('sessionDeploymentChecker', JSON.stringify(today));
    }
    return lastCheck;
  }

  render() {
    const self = this;
    const { lastDeploymentCheck, loading, inprogress, pending, finished } = self.state;

    const iconStyles = {
      fontSize: 48,
      opacity: 0.5,
      marginRight: '30px'
    };

    const headerStyle = {
      alignItems: 'center',
      justifyContent: 'flex-end'
    };

    const pendingWidgetMain = {
      counter: pending.length,
      header: (
        <div className="flexbox" style={headerStyle}>
          <UpdateIcon className="flip-horizontal" style={iconStyles} />
          <div>Pending {pluralize('deployment', pending.length)}</div>
        </div>
      ),
      targetLabel: 'View details'
    };
    const activeWidgetMain = {
      counter: inprogress.length,
      header: (
        <div className="flexbox" style={headerStyle}>
          <RefreshIcon className="flip-horizontal" style={iconStyles} />
          <div>{pluralize('Deployment', inprogress.length)} in progress</div>
        </div>
      ),
      targetLabel: 'View progress'
    };
    let onboardingComponent;
    if (this.deploymentsRef) {
      const anchor = {
        top: this.deploymentsRef.offsetTop + this.deploymentsRef.offsetHeight,
        left: this.deploymentsRef.offsetLeft + this.deploymentsRef.offsetWidth / 2
      };
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed', { anchor });
    }
    return (
      <div>
        <h4 className="dashboard-header">
          <span>Deployments</span>
        </h4>
        <div className="deployments" style={Object.assign({ marginBottom: '50px', marginTop: '50px' })}>
          {loading ? (
            <Loader show={loading} fade={true} />
          ) : (
            <div style={this.props.styles}>
              <CompletedDeployments
                onClick={() => self.props.clickHandle({ route: 'deployments/finished' })}
                deployments={finished}
                cutoffDate={lastDeploymentCheck}
                innerRef={ref => (this.deploymentsRef = ref)}
              />
              <BaseWidget
                className={inprogress.length ? 'current-widget active' : 'current-widget'}
                main={activeWidgetMain}
                onClick={() => self.props.clickHandle({ route: 'deployments/active' })}
              />
              <BaseWidget
                className={pending.length ? 'current-widget pending' : 'current-widget'}
                main={pendingWidgetMain}
                onClick={() => self.props.clickHandle({ route: 'deployments/active' })}
              />
              <RedirectionWidget
                target={'/deployments/active?open=true'}
                content={'Create a new deployment to update a group of devices'}
                buttonContent={'Create a deployment'}
                onClick={() => this.props.clickHandle({ route: '/deployments/active?open=true' })}
                isActive={false}
              />
            </div>
          )}
          {onboardingComponent}
        </div>
      </div>
    );
  }
}
