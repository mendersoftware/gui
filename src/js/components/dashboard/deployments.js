import React from 'react';
import pluralize from 'pluralize';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Loader from '../common/loader';

import { BaseWidget } from './widgets/baseWidget';
import RedirectionWidget from './widgets/redirectionwidget';
import CompletedDeployments from './widgets/completeddeployments';
import Recent from './recent';

const refreshDeploymentsLength = 30000;

export default class Deployments extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    // self.state = { devices: [], inactiveDevices: [], pendingDevices: [], deltaActivity: null, refreshDevicesLength: 30000 };
    // // on render the store might not be updated so we resort to the API and let all later request go through the store
    // // to be in sync with the rest of the UI
    // AppActions.getAllDevicesByStatus('pending').then(devices => self.setState({ pendingDevices: devices.length }));
    // self._refreshDevices().then(result => self.setState(result));

    // loadingActive={!this.state.doneActiveDepsLoading}
    // loadingRecent={!this.state.donePastDepsLoading}
    // clickHandle={this._handleClick}
    // progress={this.state.progress}
    // recent={this.state.recent}
    // completedDeployments={this.state.completed}
    // inprogressDeployments={this.state.progress}
    // pendingDeployments={this.state.pending}
    // recentDeployments={this.state.recent}
    // this.state = Object.assign(
    this.state = {
      loadingActive: true,
      loadingPending: true,
      loadingRecent: true,
      active: [],
      pending: [],
      recent: []
    };
    // this.getInitialState()
    // );
  }
  getInitialState() {
    return {
      active: AppStore.getDeploymentsInProgress(),
      pending: AppStore.getPendingDeployments(),
      recent: AppStore.getPastDeployments()
    };
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers();
    const changeEvent = this._onChange.bind(this);
    AppStore.removeChangeListener(changeEvent);
    console.log('arguments');
  }
  _onChange() {
    this.setState(this.getInitialState());
  }

  componentDidMount() {
    var self = this;
    const changeEvent = this._onChange.bind(this);
    AppStore.changeListener(changeEvent);
    clearAllRetryTimers();
    self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
    self._refreshDeployments();
  }

  handleDeploymentError(err) {
    var errormsg = err.error || 'Please check your connection';
    setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength);
  }

  getPastDeployments() {
    const self = this;
    const callback = {
      success: () => self.setState({ loadingRecent: false }),
      error: self.handleDeploymentError
    };
    return AppActions.getPastDeployments(callback, 1, 10);
  }

  getInProgressDeployments() {
    const self = this;
    const callback = {
      success: () => self.setState({ loadingActive: false }),
      error: self.handleDeploymentError
    };
    return AppActions.getDeploymentsInProgress(callback, 1, 10);
  }

  getPendingDeployments() {
    const self = this;
    const callback = {
      success: () => self.setState({ loadingPending: false }),
      error: self.handleDeploymentError
    };
    return AppActions.getPendingDeployments(callback, 1, 10);
  }

  _refreshDeployments() {
    var self = this;
    self.getPastDeployments();
    self.getInProgressDeployments();
    self.getPendingDeployments();
  }

  render() {
    const self = this;
    const { loadingActive, loadingPending, loadingRecent, active, pending, recent } = self.state;

    const pendingWidgetMain = {
      counter: pending.length,
      header: `Pending ${pluralize('deployment', pending.length)}`,
      targetLabel: 'View details'
    };
    const activeWidgetMain = {
      counter: active.length,
      header: `${pluralize('Deployment', active.length)} in progress`,
      targetLabel: 'View progress'
    };
    return (
      <div>
        <h3 className="dashboard-header">Deployments</h3>

        {/* <div className={deployments.length || self.props.loading ? 'hidden' : 'dashboard-placeholder'}>
          <p>View the results of recent deployments here</p>
          <img src="assets/img/history.png" alt="recent" />
        </div>
        <Loader show={self.props.loading} fade={true} /> */}

        <div className="deployments" style={Object.assign({ marginBottom: '50px', marginTop: '50px' })}>
          <h4>Current deployments</h4>
          <div style={this.props.styles}>
            <Loader show={loadingRecent} fade={true} />
            <CompletedDeployments onClick={() => self.props.clickHandle({ route: 'deployments/finished' })} deployments={recent} />
            <Loader show={loadingActive} fade={true} />
            <BaseWidget main={activeWidgetMain} onClick={() => self.props.clickHandle({ route: 'deployments/active' })} />
            <Loader show={loadingPending} fade={true} />
            <BaseWidget main={pendingWidgetMain} onClick={() => self.props.clickHandle({ route: 'deployments/active' })} />
            <RedirectionWidget
              target={'/deployments?open=true'}
              content={'Create a new deployment to update a group of devices'}
              buttonContent={'Create a deployment'}
              onClick={() => this.props.clickHandle({ route: 'deployments?open=true' })}
              isActive={false}
            />
          </div>
          <h4>Latest deployment activity</h4>
          <Recent loading={loadingRecent} clickHandle={self.props.clickHandle} deployments={recent} />
        </div>
      </div>
    );
  }
}
