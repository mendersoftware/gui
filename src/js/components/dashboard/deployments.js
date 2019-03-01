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
import { FontIcon } from 'material-ui';

const refreshDeploymentsLength = 30000;

export default class Deployments extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    self.state = {
      loading: true,
      inprogress: [],
      deployments: [],
      pending: [],
      finished: []
    };
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers();
    const changeEvent = this._onChange.bind(this);
    AppStore.removeChangeListener(changeEvent);
  }
  componentDidMount() {
    var self = this;
    const changeEvent = this._onChange.bind(this);
    AppStore.changeListener(changeEvent);
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
    const callback = {
      success: () => self.setState({ loading: false }),
      error: self.handleDeploymentError
    };
    return AppActions.getDeployments(callback, 1, 10);
  }
  render() {
    const self = this;
    const { loading, inprogress, deployments, pending, finished } = self.state;

    const iconStyles = {
      fontSize: 48,
      opacity: 0.4
    };

    const headerStyle = {
      alignItems: 'center',
      justifyContent: 'flex-end'
    };

    const pendingWidgetMain = {
      counter: pending.length,
      header: (
        <div className="flexbox" style={headerStyle}>
          <FontIcon className="material-icons flip-horizontal red" style={iconStyles}>
            update
          </FontIcon>
          <div>Pending {pluralize('deployment', pending.length)}</div>
        </div>
      ),
      targetLabel: 'View details'
    };
    const activeWidgetMain = {
      counter: inprogress.length,
      header: (
        <div className="flexbox" style={headerStyle}>
          <FontIcon className="material-icons flip-horizontal green" style={iconStyles}>
            refresh
          </FontIcon>
          <div>{pluralize('Deployment', inprogress.length)} in progress</div>
        </div>
      ),
      targetLabel: 'View progress'
    };
    const path = `open=true`;
    const openingParam = encodeURIComponent(path);
    return (
      <div>
        <h3 className="dashboard-header">Deployments</h3>
        <div className="deployments" style={Object.assign({ marginBottom: '50px', marginTop: '50px' })}>
          <h4>Current deployments</h4>
          {loading ? (
            <Loader show={loading} fade={true} />
          ) : (
            <div style={this.props.styles}>
              {finished.length ? (
                <CompletedDeployments onClick={() => self.props.clickHandle({ route: 'deployments/finished' })} deployments={finished} />
              ) : null}
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
                target={`/deployments/${openingParam}`}
                content={'Create a new deployment to update a group of devices'}
                buttonContent={'Create a deployment'}
                onClick={() => this.props.clickHandle({ route: `deployments/${openingParam}` })}
                isActive={false}
              />
            </div>
          )}
          <h4>Latest deployment activity</h4>
          <Recent loading={loading} clickHandle={self.props.clickHandle} deployments={deployments} />
        </div>
      </div>
    );
  }
}
