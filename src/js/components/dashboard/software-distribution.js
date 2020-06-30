import React from 'react';
import { connect } from 'react-redux';

import { BarChart as BarChartIcon } from '@material-ui/icons';

import ChartAdditionWidget from './widgets/chart-addition';
import DistributionReport from './widgets/distribution';
import EnterpriseNotification from '../common/enterpriseNotification';
import { getAllDynamicGroupDevices, getAllGroupDevices, selectGroup } from '../../actions/deviceActions';
import { saveUserSettings } from '../../actions/userActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';

export const defaultReports = [{ group: null, attribute: 'artifact_name', type: 'distribution' }];

const reportTypes = {
  distribution: DistributionReport
};

const defaultChartStyle = {
  cursor: 'initial',
  height: 280,
  justifyContent: 'initial',
  padding: 0
};

export class SoftwareDistribution extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.state = {
      reports: props.reports.length ? props.reports : Object.keys(props.devices).length ? defaultReports : [],
      selection: ''
    };
    self.state.reports.map(report => self.initializeReport(report.group));
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (prevProps.reports.length !== self.props.reports.length) {
      self.props.reports.map(report => self.initializeReport(report.group));
      self.setState({ reports: self.props.reports });
    }
  }

  initializeReport(group) {
    if (!group) {
      return Promise.resolve();
    }
    const storedGroup = this.props.groups[group];
    if (storedGroup && storedGroup.filters.length) {
      return this.props.getAllDynamicGroupDevices(group);
    }
    return this.props.getAllGroupDevices(group);
  }

  addCurrentSelection(selection) {
    const reports = [...this.state.reports, selection];
    this.setState({ reports });
    this.initializeReport(selection.group);
    this.props.saveUserSettings({ reports });
  }

  removeReport(index) {
    const reports = this.state.reports;
    reports.splice(index, 1);
    this.setState({ reports });
    this.props.saveUserSettings({ reports });
  }

  render() {
    const self = this;
    const { devices, groups, hasDevices, isEnterprise, selectGroup } = self.props;
    const { reports } = self.state;
    return !isEnterprise ? (
      <div className="flexbox centered">
        <EnterpriseNotification isEnterprise={isEnterprise} benefit="gain actionable insights into the devices you are updating with Mender" />
      </div>
    ) : (
      <div>
        <h4 className="dashboard-header">
          <span>Software distribution</span>
        </h4>
        {hasDevices ? (
          <div className="flexbox" style={{ flexWrap: 'wrap' }}>
            {reports.map((report, index) => {
              const Component = reportTypes[report.type];
              return (
                <Component
                  attribute={report.attribute}
                  devices={devices}
                  groups={groups}
                  group={report.group}
                  key={`report-${report.group}-${index}`}
                  onClick={() => self.removeReport(index)}
                  selectGroup={selectGroup}
                  style={defaultChartStyle}
                />
              );
            })}
            <ChartAdditionWidget groups={groups} onAdditionClick={selection => self.addCurrentSelection(selection)} style={defaultChartStyle} />
          </div>
        ) : (
          <div className="dashboard-placeholder">
            <BarChartIcon style={{ transform: 'scale(5)' }} />
            <p className="margin-top-large">Software distribution charts will appear here once you connected a device. </p>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = { getAllDynamicGroupDevices, getAllGroupDevices, saveUserSettings, selectGroup };

const mapStateToProps = state => {
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  const reports = state.users.globalSettings[state.users.currentUser]?.reports || state.users.globalSettings[`${state.users.currentUser}-reports`] || [];
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    attributes: state.devices.filteringAttributes.inventoryAttributes.concat(state.devices.filteringAttributes.identityAttributes) || [],
    devices: state.devices.byId,
    hasDevices: state.devices.byStatus[DEVICE_STATES.accepted].total,
    groups,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    reports
  };
};

export default connect(mapStateToProps, actionCreators)(SoftwareDistribution);
