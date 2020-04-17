import React from 'react';
import { Redirect } from 'react-router-dom';

import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

import Loader from '../common/loader';
import DeploymentsList, { defaultHeaders } from './deploymentslist';

export class Progress extends React.PureComponent {
  render() {
    const self = this;

    const { doneLoading, pending, pendingCount, pendPage, progress, progressCount, progPage } = self.props;

    let onboardingComponent = null;
    if (!self.props.onboardingComplete && this.inprogressRef) {
      const anchor = { left: 200, top: this.inprogressRef.offsetTop + this.inprogressRef.offsetHeight };
      onboardingComponent = getOnboardingComponentFor('deployments-inprogress', { anchor });
      if (
        self.props.pastDeploymentsCount &&
        getOnboardingStepCompleted('scheduling-release-to-devices') &&
        !getOnboardingStepCompleted('upload-new-artifact-tip')
      ) {
        return <Redirect to="/deployments/finished" />;
      }
    }

    return doneLoading ? (
      <div className="fadeIn">
        {!!progress.length && (
          <>
            <h4 className="dashboard-header margin-top-large">
              <span>In progress now</span>
            </h4>
            <div ref={ref => (this.inprogressRef = ref)}>
              <DeploymentsList
                headers={defaultHeaders}
                type="progress"
                count={progressCount || progress.length}
                items={progress}
                page={progPage}
                {...self.props}
              />
            </div>
          </>
        )}
        {!!onboardingComponent && onboardingComponent}
        {!!(pendingCount && pending.length) && (
          <>
            <h4 className="dashboard-header margin-top-large">
              <span>Pending</span>
            </h4>
            <DeploymentsList
              abort={id => self._abortDeployment(id)}
              count={pendingCount || pending.length}
              items={pending}
              page={pendPage}
              refreshItems={(...args) => self._refreshPending(...args)}
              {...self.props}
              type="pending"
            />
          </>
        )}
        {!(progressCount || progress.length || pendingCount || pending.length) && (
          <div className={progress.length || !doneLoading ? 'hidden' : 'dashboard-placeholder'}>
            <p>Pending and ongoing deployments will appear here. </p>
            <p>
              <a onClick={() => self.setState({ createDialog: true })}>Create a deployment</a> to get started
            </p>
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        )}
      </div>
    ) : (
      <Loader show={doneLoading} />
    );
  }
}

export default Progress;
