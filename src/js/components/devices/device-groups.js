// Copyright 2018 Northern.tech AS
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
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AddCircle as AddIcon } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import pluralize from 'pluralize';

import { setOfflineThreshold, setSnackbar } from '../../actions/appActions';
import {
  addDynamicGroup,
  addStaticGroup,
  getAllDeviceCounts,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  updateDynamicGroup
} from '../../actions/deviceActions';
import { setShowConnectingDialog } from '../../actions/userActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { DEVICE_FILTERING_OPTIONS, DEVICE_ISSUE_OPTIONS, DEVICE_STATES, emptyFilter } from '../../constants/deviceConstants';
import { toggle, versionCompare } from '../../helpers';
import { getDocsVersion, getFeatures, getGroups as getGroupsSelector, getLimitMaxed, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { useLocationParams } from '../../utils/liststatehook';
import Global from '../settings/global';
import AuthorizedDevices from './authorized-devices';
import DeviceStatusNotification from './devicestatusnotification';
import MakeGatewayDialog from './dialogs/make-gateway-dialog';
import PreauthDialog, { DeviceLimitWarning } from './dialogs/preauth-dialog';
import CreateGroup from './group-management/create-group';
import CreateGroupExplainer from './group-management/create-group-explainer';
import RemoveGroup from './group-management/remove-group';
import Groups from './groups';
import DeviceAdditionWidget from './widgets/deviceadditionwidget';

const refreshLength = TIMEOUTS.refreshDefault;

export const DeviceGroups = ({
  acceptedCount,
  addDynamicGroup,
  addStaticGroup,
  authRequestCount,
  canPreview,
  canManageDevices,
  deviceLimit,
  deviceListState,
  docsVersion,
  features,
  filteringAttributes,
  filters,
  getAllDeviceCounts,
  groupCount,
  groupFilters,
  groups,
  groupsByType,
  hasReporting,
  limitMaxed,
  pendingCount,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectedGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  setShowConnectingDialog,
  setOfflineThreshold,
  setSnackbar,
  showDeviceConnectionDialog,
  showHelptips,
  tenantCapabilities,
  updateDynamicGroup
}) => {
  const [createGroupExplanation, setCreateGroupExplanation] = useState(false);
  const [fromFilters, setFromFilters] = useState(false);
  const [modifyGroupDialog, setModifyGroupDialog] = useState(false);
  const [openIdDialog, setOpenIdDialog] = useState(false);
  const [openPreauth, setOpenPreauth] = useState(false);
  const [showMakeGateway, setShowMakeGateway] = useState(false);
  const [removeGroup, setRemoveGroup] = useState(false);
  const [tmpDevices, setTmpDevices] = useState([]);
  const deviceTimer = useRef();
  const { isEnterprise } = tenantCapabilities;
  const { status: statusParam } = useParams();

  const [locationParams, setLocationParams] = useLocationParams('devices', {
    filteringAttributes,
    filters,
    defaults: { sort: { direction: SORTING_OPTIONS.desc } }
  });

  const { refreshTrigger, selectedId, state: selectedState } = deviceListState;

  useEffect(() => {
    if (!deviceTimer.current) {
      return;
    }
    setLocationParams({ pageState: deviceListState, filters, selectedGroup });
  }, [
    deviceListState.detailsTab,
    deviceListState.page,
    deviceListState.perPage,
    deviceListState.selectedIssues,
    JSON.stringify(deviceListState.sort),
    selectedId,
    filters,
    selectedGroup,
    selectedState
  ]);

  useEffect(() => {
    if (locationParams.groupName) {
      selectGroup(locationParams.groupName);
    }
    let listState = { setOnly: true };
    if (locationParams.open && locationParams.id.length) {
      listState = { ...listState, selectedId: locationParams.id[0], detailsTab: locationParams.detailsTab };
    }
    if (!locationParams.id?.length && selectedId) {
      listState = { ...listState, detailsTab: 'identity' };
    }
    setDeviceListState(listState);
  }, [locationParams.detailsTab, locationParams.groupName, JSON.stringify(locationParams.id), locationParams.open]);

  useEffect(() => {
    const { groupName, filters = [], id = [], ...remainder } = locationParams;
    const { hasFullFiltering } = tenantCapabilities;
    if (groupName) {
      selectGroup(groupName, filters);
    } else if (filters.length) {
      setDeviceFilters(filters);
    }
    const state = statusParam && Object.values(DEVICE_STATES).some(state => state === statusParam) ? statusParam : selectedState;
    let listState = { ...remainder, state, refreshTrigger: !refreshTrigger };
    if (id.length === 1 && Boolean(locationParams.open)) {
      listState.selectedId = id[0];
    } else if (id.length && hasFullFiltering) {
      setDeviceFilters([...filters, { ...emptyFilter, key: 'id', operator: DEVICE_FILTERING_OPTIONS.$in.key, value: id }]);
    }
    setDeviceListState(listState);
    clearInterval(deviceTimer.current);
    deviceTimer.current = setInterval(getAllDeviceCounts, refreshLength);
    setOfflineThreshold();
    return () => {
      clearInterval(deviceTimer.current);
    };
  }, []);

  /*
   * Groups
   */
  const removeCurrentGroup = () => {
    const request = groupFilters.length ? removeDynamicGroup(selectedGroup) : removeStaticGroup(selectedGroup);
    return request.then(toggleGroupRemoval).catch(console.log);
  };

  // Edit groups from device selection
  const addDevicesToGroup = tmpDevices => {
    // (save selected devices in state, open dialog)
    setTmpDevices(tmpDevices);
    setModifyGroupDialog(toggle);
  };

  const createGroupFromDialog = (devices, group) => {
    let request = fromFilters ? addDynamicGroup(group, filters) : addStaticGroup(group, devices);
    return request.then(() => {
      // reached end of list
      setCreateGroupExplanation(false);
      setModifyGroupDialog(false);
      setFromFilters(false);
    });
  };

  const onGroupClick = () => {
    if (selectedGroup && groupFilters.length) {
      return updateDynamicGroup(selectedGroup, filters);
    }
    setModifyGroupDialog(true);
    setFromFilters(true);
  };

  const onRemoveDevicesFromGroup = devices => {
    const isGroupRemoval = devices.length >= groupCount;
    let request;
    if (isGroupRemoval) {
      request = removeStaticGroup(selectedGroup);
    } else {
      request = removeDevicesFromGroup(selectedGroup, devices);
    }
    return request.catch(console.log);
  };

  const openSettingsDialog = e => {
    e.preventDefault();
    setOpenIdDialog(toggle);
  };

  const onCreateGroupClose = () => {
    setModifyGroupDialog(false);
    setFromFilters(false);
    setTmpDevices([]);
  };

  const onPreauthSaved = addMore => {
    setOpenPreauth(!addMore);
    setDeviceListState({ page: 1, refreshTrigger: !refreshTrigger });
  };

  const onShowDeviceStateClick = state => {
    selectGroup();
    setDeviceListState({ state });
  };

  const onGroupSelect = groupName => {
    selectGroup(groupName);
    setDeviceListState({ page: 1, refreshTrigger: !refreshTrigger, selection: [] });
  };

  const onShowAuthRequestDevicesClick = () => {
    setDeviceFilters([]);
    setDeviceListState({ selectedIssues: [DEVICE_ISSUE_OPTIONS.authRequests.key], page: 1 });
  };

  const toggleGroupRemoval = () => setRemoveGroup(toggle);

  const toggleMakeGatewayClick = () => setShowMakeGateway(toggle);

  return (
    <>
      <div className="tab-container with-sub-panels margin-bottom-small" style={{ padding: 0, minHeight: 'initial' }}>
        <h3 style={{ marginBottom: 0 }}>Devices</h3>
        <div className="flexbox space-between margin-left-large margin-right center-aligned padding-bottom padding-top-small">
          {hasReporting && !!authRequestCount && (
            <a className="flexbox center-aligned margin-right-large" onClick={onShowAuthRequestDevicesClick}>
              <AddIcon fontSize="small" style={{ marginRight: 6 }} />
              {authRequestCount} new device authentication {pluralize('request', authRequestCount)}
            </a>
          )}
          {!!pendingCount && !selectedGroup && selectedState !== DEVICE_STATES.pending ? (
            <DeviceStatusNotification deviceCount={pendingCount} state={DEVICE_STATES.pending} onClick={onShowDeviceStateClick} />
          ) : (
            <div />
          )}
          {canManageDevices && (
            <DeviceAdditionWidget
              docsVersion={docsVersion}
              features={features}
              onConnectClick={setShowConnectingDialog}
              onMakeGatewayClick={toggleMakeGatewayClick}
              onPreauthClick={setOpenPreauth}
              tenantCapabilities={tenantCapabilities}
            />
          )}
        </div>
      </div>
      <div className="tab-container with-sub-panels" style={{ padding: 0, height: '100%' }}>
        <Groups
          className="leftFixed"
          acceptedCount={acceptedCount}
          changeGroup={onGroupSelect}
          groups={groupsByType}
          openGroupDialog={setCreateGroupExplanation}
          selectedGroup={selectedGroup}
          showHelptips={showHelptips}
        />
        <div className="rightFluid relative" style={{ paddingTop: 0 }}>
          {limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedCount} deviceLimit={deviceLimit} />}
          <AuthorizedDevices
            addDevicesToGroup={addDevicesToGroup}
            onGroupClick={onGroupClick}
            onGroupRemoval={toggleGroupRemoval}
            onMakeGatewayClick={toggleMakeGatewayClick}
            onPreauthClick={setOpenPreauth}
            openSettingsDialog={openSettingsDialog}
            removeDevicesFromGroup={onRemoveDevicesFromGroup}
            showsDialog={showDeviceConnectionDialog || removeGroup || modifyGroupDialog || createGroupExplanation || openIdDialog || openPreauth}
          />
        </div>
        {removeGroup && <RemoveGroup onClose={toggleGroupRemoval} onRemove={removeCurrentGroup} />}
        {modifyGroupDialog && (
          <CreateGroup
            addListOfDevices={createGroupFromDialog}
            fromFilters={fromFilters}
            groups={groups}
            isCreation={fromFilters || !groups.length}
            selectedDevices={tmpDevices}
            onClose={onCreateGroupClose}
          />
        )}
        {createGroupExplanation && <CreateGroupExplainer isEnterprise={isEnterprise} onClose={() => setCreateGroupExplanation(false)} />}
        {openIdDialog && (
          <Dialog open>
            <DialogTitle>Default device identity attribute</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              <Global dialog closeDialog={openSettingsDialog} />
            </DialogContent>
          </Dialog>
        )}
        {openPreauth && (
          <PreauthDialog
            acceptedDevices={acceptedCount}
            deviceLimit={deviceLimit}
            limitMaxed={limitMaxed}
            preauthDevice={preauthDevice}
            onSubmit={onPreauthSaved}
            onCancel={() => setOpenPreauth(false)}
            setSnackbar={setSnackbar}
          />
        )}
        {showMakeGateway && <MakeGatewayDialog docsVersion={docsVersion} isPreRelease={canPreview} onCancel={toggleMakeGatewayClick} />}
      </div>
    </>
  );
};

const actionCreators = {
  addDynamicGroup,
  addStaticGroup,
  getAllDeviceCounts,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  setOfflineThreshold,
  setShowConnectingDialog,
  setSnackbar,
  updateDynamicGroup
};

const mapStateToProps = state => {
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupCount = state.devices.groups.byId[selectedGroup].total;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  const filteringAttributes = { ...state.devices.filteringAttributes, identityAttributes: [...state.devices.filteringAttributes.identityAttributes, 'id'] };
  const { canManageDevices } = getUserCapabilities(state);
  const tenantCapabilities = getTenantCapabilities(state);
  const { groupNames, ...groupsByType } = getGroupsSelector(state);
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    authRequestCount: state.monitor.issueCounts.byType[DEVICE_ISSUE_OPTIONS.authRequests.key].total,
    canPreview: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    canManageDevices,
    deviceLimit: state.devices.limit,
    deviceListState: state.devices.deviceList,
    docsVersion: getDocsVersion(state),
    features: getFeatures(state),
    filteringAttributes,
    filters: state.devices.filters || [],
    groups: groupNames,
    groupsByType,
    groupCount,
    groupFilters,
    hasReporting: state.app.features.hasReporting,
    limitMaxed: getLimitMaxed(state),
    pendingCount: state.devices.byStatus.pending.total || 0,
    selectedGroup,
    showDeviceConnectionDialog: state.users.showConnectDeviceDialog,
    showHelptips: state.users.showHelptips,
    tenantCapabilities
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceGroups);
