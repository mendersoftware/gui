import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { BarChart as BarChartIcon } from '@mui/icons-material';

import ChartAdditionWidget from './widgets/chart-addition';
import DistributionReport from './widgets/distribution';
import EnterpriseNotification from '../common/enterpriseNotification';
import { getAllDynamicGroupDevices, getAllGroupDevices, selectGroup } from '../../actions/deviceActions';
import { saveUserSettings } from '../../actions/userActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { getIsEnterprise, getUserSettings } from '../../selectors';
import LinedHeader from '../common/lined-header';

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

export const SoftwareDistribution = ({
  devices,
  getAllDynamicGroupDevices,
  getAllGroupDevices,
  groups,
  hasDevices,
  isEnterprise,
  reports,
  saveUserSettings,
  selectGroup
}) => {
  useEffect(() => {
    reports.map(report => initializeReport(report.group));
  }, []);

  useEffect(() => {
    reports.map(report => initializeReport(report.group));
  }, [reports]);

  const initializeReport = group => {
    if (!group) {
      return Promise.resolve();
    }
    const storedGroup = groups[group];
    if (storedGroup && storedGroup.filters.length) {
      return getAllDynamicGroupDevices(group);
    }
    return getAllGroupDevices(group);
  };

  const addCurrentSelection = selection => {
    const newReports = [...reports, selection];
    initializeReport(selection.group);
    saveUserSettings({ reports: newReports });
  };

  const removeReport = removedReport => {
    saveUserSettings({ reports: reports.filter(report => report !== removedReport) });
  };

  return !isEnterprise ? (
    <div className="flexbox centered">
      <EnterpriseNotification isEnterprise={isEnterprise} benefit="actionable insights into the devices you are updating with Mender" />
    </div>
  ) : (
    <div>
      <LinedHeader heading="Software distribution" />
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
                onClick={() => removeReport(report)}
                selectGroup={selectGroup}
                style={defaultChartStyle}
              />
            );
          })}
          <ChartAdditionWidget groups={groups} onAdditionClick={addCurrentSelection} style={defaultChartStyle} />
        </div>
      ) : (
        <div className="dashboard-placeholder">
          <BarChartIcon style={{ transform: 'scale(5)' }} />
          <p className="margin-top-large">Software distribution charts will appear here once you connected a device. </p>
        </div>
      )}
    </div>
  );
};

const actionCreators = { getAllDynamicGroupDevices, getAllGroupDevices, saveUserSettings, selectGroup };

const mapStateToProps = state => {
  const reports =
    getUserSettings(state).reports ||
    state.users.globalSettings[`${state.users.currentUser}-reports`] ||
    (Object.keys(state.devices.byId).length ? defaultReports : []);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    attributes: state.devices.filteringAttributes.inventoryAttributes.concat(state.devices.filteringAttributes.identityAttributes) || [],
    devices: state.devices.byId,
    hasDevices: state.devices.byStatus[DEVICE_STATES.accepted].total,
    groups,
    isEnterprise: getIsEnterprise(state),
    reports
  };
};

export default connect(mapStateToProps, actionCreators)(SoftwareDistribution);
