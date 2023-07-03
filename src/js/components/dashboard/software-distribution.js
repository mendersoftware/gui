// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BarChart as BarChartIcon } from '@mui/icons-material';

import {
  defaultReportType,
  defaultReports,
  deriveReportsData,
  getDeviceAttributes,
  getGroupDevices,
  getReportingLimits,
  getReportsData
} from '../../actions/deviceActions';
import { saveUserSettings } from '../../actions/userActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { rootfsImageVersion, softwareTitleMap } from '../../constants/releaseConstants';
import { isEmpty } from '../../helpers';
import { getAttributesList, getFeatures, getIsEnterprise, getUserSettings } from '../../selectors';
import EnterpriseNotification from '../common/enterpriseNotification';
import { extractSoftwareInformation } from '../devices/device-details/installedsoftware';
import ChartAdditionWidget from './widgets/chart-addition';
import DistributionReport from './widgets/distribution';

const reportTypes = {
  distribution: DistributionReport
};

const getLayerKey = ({ title, key }, parent) => `${parent.length ? `${parent}.` : parent}${key.length <= title.length ? key : title}`;

const generateLayer = (softwareLayer, parentKey = '', nestingLevel = 0) => {
  const { children, key, title } = softwareLayer;
  const suffix = title === key ? '.version' : '';
  const layerKey = getLayerKey(softwareLayer, parentKey);
  const layerTitle = `${layerKey}${suffix}`;
  let headerItems = [{ title, nestingLevel, value: layerKey }];
  if (softwareTitleMap[layerTitle]) {
    headerItems = [
      { subheader: title, nestingLevel, value: `${layerTitle}-subheader` },
      { title: softwareTitleMap[layerTitle].title, nestingLevel: nestingLevel + 1, value: layerTitle }
    ];
  } else if (!isEmpty(children)) {
    headerItems = [{ subheader: title, nestingLevel, value: `${layerTitle}-subheader` }];
  }
  return Object.values(softwareLayer.children).reduce((accu, childLayer) => {
    const layerData = generateLayer(childLayer, getLayerKey(softwareLayer, parentKey), nestingLevel + 1);
    accu.push(...layerData);
    return accu;
  }, headerItems);
};

const listSoftware = attributes => {
  const enhancedAttributes = attributes.reduce((accu, attribute) => ({ ...accu, [attribute]: attribute }), {});
  const softwareTree = extractSoftwareInformation(enhancedAttributes, false);
  const { rootFs, remainder } = Object.values(softwareTree).reduce(
    (accu, layer) => {
      if (layer.key.startsWith('rootfs-image')) {
        return { ...accu, rootFs: layer };
      }
      accu.remainder.push(layer);
      return accu;
    },
    { rootFs: undefined, remainder: [] }
  );

  return (rootFs ? [rootFs, ...remainder] : remainder).flatMap(softwareLayer => generateLayer(softwareLayer));
};

export const SoftwareDistribution = () => {
  const dispatch = useDispatch();

  const reports = useSelector(
    state =>
      getUserSettings(state).reports ||
      state.users.globalSettings[`${state.users.currentUser}-reports`] ||
      (Object.keys(state.devices.byId).length ? defaultReports : [])
  );
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = useSelector(state => state.devices.groups.byId);
  const { hasReporting } = useSelector(getFeatures);
  const attributes = useSelector(getAttributesList);
  const hasDevices = useSelector(state => state.devices.byStatus[DEVICE_STATES.accepted].total);
  const isEnterprise = useSelector(getIsEnterprise);
  const reportsData = useSelector(state => state.devices.reports);

  useEffect(() => {
    dispatch(getDeviceAttributes());
    if (hasReporting) {
      dispatch(getReportingLimits());
    }
  }, []);

  useEffect(() => {
    if (hasReporting) {
      dispatch(getReportsData());
      return;
    }
    dispatch(deriveReportsData());
  }, [JSON.stringify(reports)]);

  const addCurrentSelection = selection => {
    const newReports = [...reports, { ...defaultReports[0], ...selection }];
    dispatch(saveUserSettings({ reports: newReports }));
  };

  const onSaveChangedReport = (change, index) => {
    let newReports = [...reports];
    newReports.splice(index, 1, change);
    dispatch(saveUserSettings({ reports: newReports }));
  };

  const removeReport = removedReport => dispatch(saveUserSettings({ reports: reports.filter(report => report !== removedReport) }));

  const software = useMemo(() => listSoftware(hasReporting ? attributes : [rootfsImageVersion]), [JSON.stringify(attributes), hasReporting]);

  if (!isEnterprise) {
    return (
      <div className="flexbox centered">
        <EnterpriseNotification isEnterprise={isEnterprise} benefit="actionable insights into the devices you are updating with Mender" />
      </div>
    );
  }
  return hasDevices ? (
    <div className="dashboard margin-bottom-large">
      {reports.map((report, index) => {
        const Component = reportTypes[report.type || defaultReportType];
        return (
          <Component
            key={`report-${report.group}-${index}`}
            data={reportsData[index]}
            getGroupDevices={(...args) => dispatch(getGroupDevices(...args))}
            groups={groups}
            onClick={() => removeReport(report)}
            onSave={change => onSaveChangedReport(change, index)}
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

export default SoftwareDistribution;
