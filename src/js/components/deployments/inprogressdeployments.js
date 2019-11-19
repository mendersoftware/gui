import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import AppStore from '../../stores/app-store';

import DeploymentsList from './deploymentslist';

const columnHeaders = [
  { title: 'Release', class: '' },
  { title: 'Device group', class: '' },
  { title: 'Start time', class: '' },
  { title: 'Total # devices', class: 'align-right' },
  { title: 'Overall progress', class: '' },
  { title: '', class: '' },
  { title: '', class: '' }
];

export class Progress extends React.PureComponent {
  render() {
    const self = this;

    let onboardingComponent = null;
    if (!self.props.onboardingComplete && this.inprogressRef) {
      const anchor = { left: 200, top: this.inprogressRef.offsetTop + this.inprogressRef.offsetHeight };
      onboardingComponent = getOnboardingComponentFor('deployments-inprogress', { anchor });
      if (
        AppStore.getPastDeployments() &&
        getOnboardingStepCompleted('scheduling-release-to-devices') &&
        !getOnboardingStepCompleted('upload-new-artifact-tip')
      ) {
        return <Redirect to="/deployments/finished" />;
      }
    }

    return (
      <div>
        {!!self.props.items.length && (
          <div ref={ref => (this.inprogressRef = ref)}>
            <DeploymentsList headers={columnHeaders} {...self.props} />
          </div>
        )}
        {!!onboardingComponent && onboardingComponent}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    onboardingComplete: state.users.onboarding.complete
  };
};

export default connect(mapStateToProps)(Progress);
