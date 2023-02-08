import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { BarChart as BarChartIcon } from '@mui/icons-material';

import { getAllDynamicGroupDevices, getAllGroupDevices, getDeviceAttributes, getReportingLimits, selectGroup } from '../../actions/deviceActions';
import { saveUserSettings } from '../../actions/userActions';
import { emptyChartSelection } from '../../constants/appConstants';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { getAttributesList, getIsEnterprise, getUserSettings } from '../../selectors';
import EnterpriseNotification from '../common/enterpriseNotification';
import { extractSoftwareInformation } from '../devices/device-details/installedsoftware';
import ChartAdditionWidget from './widgets/chart-addition';
import DistributionReport from './widgets/distribution';

export const defaultReports = [{ ...emptyChartSelection, group: null, attribute: 'artifact_name', type: 'distribution' }];

const reportTypes = {
  distribution: DistributionReport
};

export const SoftwareDistribution = ({
  attributes,
  devices,
  getAllDynamicGroupDevices,
  getAllGroupDevices,
  getDeviceAttributes,
  getReportingLimits,
  groups,
  hasDevices,
  isEnterprise,
  reports,
  saveUserSettings,
  selectGroup
}) => {
  useEffect(() => {
    reports.map(report => initializeReport(report.group));
    getDeviceAttributes();
    getReportingLimits();
  }, []);

  useEffect(() => {
    reports.map(report => initializeReport(report.group));
  }, [JSON.stringify(reports)]);

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

  const software = useMemo(() => {
    const enhancedAttributes = attributes.reduce((accu, attribute) => ({ ...accu, [attribute]: attribute }), {});
    return extractSoftwareInformation(enhancedAttributes, false);
  }, [JSON.stringify(attributes)]);

  if (!isEnterprise) {
    return (
      <div className="flexbox centered">
        <EnterpriseNotification isEnterprise={isEnterprise} benefit="actionable insights into the devices you are updating with Mender" />
      </div>
    );
  }
  return hasDevices ? (
    <div className="dashboard">
      {reports.map((report, index) => {
        const Component = reportTypes[report.type];
        return (
          <Component
            attributes={attributes}
            devices={devices}
            groups={groups}
            key={`report-${report.group}-${index}`}
            onClick={() => removeReport(report)}
            selectGroup={selectGroup}
            selection={report}
            software={software}
          />
        );
      })}
      <ChartAdditionWidget groups={groups} onAdditionClick={addCurrentSelection} software={software} />
    </div>
  ) : (
    <div className="dashboard-placeholder margin-top-large">
      <BarChartIcon style={{ transform: 'scale(5)' }} />
      <p className="margin-top-large">Software distribution charts will appear here once you connected a device. </p>
    </div>
  );
};

const actionCreators = { getAllDynamicGroupDevices, getAllGroupDevices, getDeviceAttributes, getReportingLimits, saveUserSettings, selectGroup };

const mapStateToProps = state => {
  const reports =
    getUserSettings(state).reports ||
    state.users.globalSettings[`${state.users.currentUser}-reports`] ||
    (Object.keys(state.devices.byId).length ? defaultReports : []);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    attributes: getAttributesList(state),
    devices: state.devices.byId,
    hasDevices: state.devices.byStatus[DEVICE_STATES.accepted].total,
    groups,
    isEnterprise: getIsEnterprise(state),
    reports
  };
};

export default connect(mapStateToProps, actionCreators)(SoftwareDistribution);
