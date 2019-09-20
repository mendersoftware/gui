import React from 'react';
import { Redirect } from 'react-router-dom';

import DeploymentItem from './deploymentitem';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import { getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';
import AppStore from '../../stores/app-store';

const columnHeaders = [
  { title: 'Release', class: '' },
  { title: 'Device group', class: '' },
  { title: 'Start time', class: '' },
  { title: 'Total # devices', class: 'align-right' },
  { title: 'Overall progress', class: '' }
];

export default class Progress extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      retry: false,
      pageSize: 20
    };
  }

  render() {
    const self = this;
    // get statistics for each in progress
    const progressMap = this.props.progress.map((deployment, index) => (
      <DeploymentItem
        columnHeaders={columnHeaders}
        deployment={deployment}
        key={`deployment-${index}`}
        index={index}
        isActiveTab={this.props.isActiveTab}
        openReport={this.props.openReport}
        type="progress"
      />
    ));

    let onboardingComponent = null;
    if (!AppStore.getOnboardingComplete() && this.inprogressRef) {
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
      <div className="fadeIn deploy-table-contain">
        {progressMap.length ? (
          <div ref={ref => (this.inprogressRef = ref)}>
            <h3>In progress</h3>
            <div className="deployment-item deployment-header-item muted">
              {columnHeaders.map(item => (
                <div key={item.title} className={item.class}>
                  {item.title}
                </div>
              ))}
            </div>
            {progressMap}
          </div>
        ) : (
          <Loader show={this.props.loading} />
        )}
        {this.props.count > this.props.progress.length ? (
          <Pagination
            count={self.props.count}
            rowsPerPage={self.state.pageSize}
            onChangeRowsPerPage={pageSize => self.setState({ pageSize }, () => self.props.refreshProgress(1, pageSize))}
            page={self.props.page}
            onChangePage={page => self.props.refreshProgress(page, self.state.pageSize)}
          />
        ) : null}
        {this.props.count || this.props.pendingCount ? null : (
          <div className={progressMap.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
            <p>Pending and ongoing deployments will appear here. </p>
            <p>
              <a onClick={this.props.createClick}>Create a deployment</a> to get started
            </p>
            <img src="assets/img/deployments.png" alt="In progress" />
          </div>
        )}
        {onboardingComponent ? onboardingComponent : null}
      </div>
    );
  }
}
