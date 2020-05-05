import React from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import RefreshIcon from '@material-ui/icons/Refresh';
import UpdateIcon from '@material-ui/icons/Update';

import { setSnackbar } from '../../actions/appActions';
import { getDeployments } from '../../actions/deploymentActions';
import { clearAllRetryTimers, setRetryTimer } from '../../utils/retrytimer';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Loader from '../common/loader';

import { BaseWidget } from './widgets/baseWidget';
import RedirectionWidget from './widgets/redirectionwidget';
import CompletedDeployments from './widgets/completeddeployments';

const refreshDeploymentsLength = 30000;

const iconStyles = {
  fontSize: 48,
  opacity: 0.5,
  marginRight: '30px'
};

const headerStyle = {
  alignItems: 'center',
  justifyContent: 'flex-end'
};

export class Deployments extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    const lastDeploymentCheck = self.updateDeploymentCutoff(new Date());
    self.state = {
      lastDeploymentCheck,
      loading: true
    };
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers(this.props.setSnackbar);
  }
  componentDidMount() {
    var self = this;
    clearAllRetryTimers(self.props.setSnackbar);
    self.timer = setInterval(() => self.getDeployments(), refreshDeploymentsLength);
    self.getDeployments();
  }

  getDeployments() {
    const self = this;
    return self.props
      .getDeployments(1, 20)
      .then(() => self.setState({ loading: false }))
      .catch(err => {
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
      });
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
    const { inprogressCount, pendingCount, finished } = self.props;
    const { lastDeploymentCheck, loading } = self.state;

    const pendingWidgetMain = {
      counter: pendingCount,
      header: (
        <div className="flexbox" style={headerStyle}>
          <UpdateIcon className="flip-horizontal" style={iconStyles} />
          <div>Pending {pluralize('deployment', pendingCount)}</div>
        </div>
      ),
      targetLabel: 'View details'
    };
    const activeWidgetMain = {
      counter: inprogressCount,
      header: (
        <div className="flexbox" style={headerStyle}>
          <RefreshIcon className="flip-horizontal" style={iconStyles} />
          <div>{pluralize('Deployment', inprogressCount)} in progress</div>
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
                onClick={deploymentsTimeframe => self.props.clickHandle(deploymentsTimeframe)}
                deployments={finished}
                cutoffDate={lastDeploymentCheck}
                innerRef={ref => (this.deploymentsRef = ref)}
              />
              <BaseWidget
                className={inprogressCount ? 'current-widget active' : 'current-widget'}
                main={activeWidgetMain}
                onClick={() => self.props.clickHandle({ route: 'deployments/active' })}
              />
              <BaseWidget
                className={pendingCount ? 'current-widget pending' : 'current-widget'}
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

const actionCreators = { getDeployments, setSnackbar };

const mapStateToProps = state => {
  const deploymentsByState = Object.values(state.deployments.byId).reduce(
    (accu, item) => {
      accu[item.status].push(item);
      return accu;
    },
    Object.keys(state.deployments.byStatus).reduce((accu, item) => {
      accu[item] = [];
      return accu;
    }, {})
  );
  return {
    finished: state.deployments.byStatus.finished.total
      ? state.deployments.byStatus.finished.deploymentIds.map(id => state.deployments.byId[id])
      : deploymentsByState.finished,
    inprogressCount: state.deployments.byStatus.inprogress.total ? state.deployments.byStatus.inprogress.total : deploymentsByState.inprogress.length,
    pendingCount: state.deployments.byStatus.pending.total ? state.deployments.byStatus.pending.total : deploymentsByState.pending.length
  };
};

export default connect(mapStateToProps, actionCreators)(Deployments);
