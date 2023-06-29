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
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BarChart as BarChartIcon } from '@mui/icons-material';

import {
  defaultReportType,
  defaultReports,
  deriveReportsData,
  getDeviceAttributes,
  getDevicesInBounds,
  getGroupDevices,
  getReportingLimits,
  getReportsData
} from '../../actions/deviceActions';
import { saveUserSettings } from '../../actions/userActions';
import { rootfsImageVersion, softwareTitleMap } from '../../constants/releaseConstants';
import { isEmpty } from '../../helpers';
import {
  getAcceptedDevices,
  getAttributesList,
  getDeviceReports,
  getDeviceReportsForUser,
  getDevicesById,
  getFeatures,
  getGroupNames,
  getGroupsByIdWithoutUngrouped,
  getIsEnterprise
} from '../../selectors';
import EnterpriseNotification from '../common/enterpriseNotification';
import { extractSoftwareInformation } from '../devices/device-details/installedsoftware';
import ChartAdditionWidget from './widgets/chart-addition';
import DistributionReport from './widgets/distribution';
import MapWrapper from './widgets/mapwidget';

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

  const reports = useSelector(getDeviceReportsForUser);
  const groups = useSelector(getGroupsByIdWithoutUngrouped);
  const { hasReporting } = useSelector(getFeatures);
  const attributes = useSelector(getAttributesList);
  const { total } = useSelector(getAcceptedDevices);
  const hasDevices = !!total;
  const isEnterprise = useSelector(getIsEnterprise);
  const reportsData = useSelector(getDeviceReports);
  const groupNames = useSelector(getGroupNames);
  const devicesById = useSelector(getDevicesById);

  useEffect(() => {
    dispatch(getDeviceAttributes());
    if (hasReporting) {
      dispatch(getReportingLimits());
    }
  }, [dispatch, hasReporting]);

  useEffect(() => {
    if (hasReporting) {
      dispatch(getReportsData());
      return;
    }
    dispatch(deriveReportsData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, hasReporting, JSON.stringify(reports)]);

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

  const onGetGroupDevices = useCallback((...args) => dispatch(getGroupDevices(...args)), [dispatch]);
  const onGetDevicesInBounds = useCallback((...args) => dispatch(getDevicesInBounds(...args)), [dispatch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <MapWrapper
        groups={groups}
        groupNames={groupNames}
        devicesById={devicesById}
        getGroupDevices={onGetGroupDevices}
        getDevicesInBounds={onGetDevicesInBounds}
      />
      {reports.map((report, index) => {
        const Component = reportTypes[report.type || defaultReportType];
        return (
          <Component
            key={`report-${report.group}-${index}`}
            data={reportsData[index]}
            getGroupDevices={onGetGroupDevices}
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
