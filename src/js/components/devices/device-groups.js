import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import pluralize from 'pluralize';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { AddCircle as AddIcon } from '@mui/icons-material';

import { setSnackbar, setYesterday } from '../../actions/appActions';
import {
  addDynamicGroup,
  addStaticGroup,
  getAllDeviceCounts,
  getDynamicGroups,
  getGroups,
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
import { DEVICE_ISSUE_OPTIONS, DEVICE_STATES } from '../../constants/deviceConstants';
import { getDocsVersion, getFeatures, getLimitMaxed, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import Global from '../settings/global';
import AuthorizedDevices from './authorized-devices';
import CreateGroup from './group-management/create-group';
import RemoveGroup from './group-management/remove-group';
import CreateGroupExplainer from './group-management/create-group-explainer';
import MakeGatewayDialog from './dialogs/make-gateway-dialog';
import PreauthDialog, { DeviceLimitWarning } from './dialogs/preauth-dialog';
import DeviceAdditionWidget from './widgets/deviceadditionwidget';
import Groups from './groups';
import DeviceStatusNotification from './devicestatusnotification';
import { versionCompare } from '../../helpers';
import { routes } from './base-devices';
import { convertQuery, generateBrowserLocation } from '../../utils/locationutils';

const refreshLength = 10000;

const alignUrlDeviceStatus = status => (status && Object.values(DEVICE_STATES).some(state => state === status) ? status : '');

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
  getDynamicGroups,
  getGroups,
  groupCount,
  groupFilters,
  groups,
  groupsById,
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
  setSnackbar,
  setYesterday,
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
  const [isReconciling, setIsReconciling] = useState(false);
  const deviceTimer = useRef();
  const { isEnterprise } = tenantCapabilities;
  const { status: statusParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { refreshTrigger, state: selectedState } = deviceListState;

  useEffect(() => {
    const status = alignUrlDeviceStatus(statusParam);
    maybeSetGroupAndFilters(location.search, filteringAttributes, filters);
    let request;
    if (status && selectedState !== status) {
      setIsReconciling(true);
      request = setDeviceListState({ state: status }).then(() => setIsReconciling(false));
    }
    maybeSetLocation({
      pageState: deviceListState,
      filters,
      selectedGroup,
      selectedId: selectedDeviceId,
      location,
      isInitialization: true
    });
    clearInterval(deviceTimer.current);
    deviceTimer.current = setInterval(getAllDeviceCounts, refreshLength);
    setYesterday();
    request ? null : setDeviceListState({ refreshTrigger: !refreshTrigger });
    return () => {
      clearInterval(deviceTimer.current);
    };
  }, []);

  useEffect(() => {
    refreshGroups();
  }, [groupCount]);

  useEffect(() => {
    if (!deviceTimer.current) {
      return;
    }
    maybeSetLocation({
      pageState: deviceListState,
      filters,
      selectedGroup,
      selectedId: selectedDeviceId,
      location
    });
  }, [selectedState, filters, selectedGroup]);

  useEffect(() => {
    if (!deviceTimer.current) {
      return;
    }
    const status = alignUrlDeviceStatus(statusParam);
    maybeSetGroupAndFilters(location.search, filteringAttributes, filters);
    if (selectedState !== status && selectedState !== routes.allDevices.key && status && location.pathname.includes(status) && !isReconciling) {
      setIsReconciling(true);
      setDeviceListState({ state: status ? status : routes.allDevices.key }).then(() => setIsReconciling(false));
    }
  }, [filters, statusParam, location.search]);

  const maybeSetGroupAndFilters = (query, attributes, currentFilters) => {
    if (query) {
      const { filters: queryFilters, groupName } = convertQuery(query, attributes, currentFilters);
      if (groupName) {
        selectGroup(groupName, queryFilters);
      } else if (queryFilters) {
        setDeviceFilters(queryFilters);
      }
    }
  };

  const maybeSetLocation = props => {
    const { location } = props;
    const { pathname, search } = generateBrowserLocation(props);
    if (pathname !== undefined && (pathname !== location.pathname || location.search !== `?${search}`)) {
      navigate({ pathname, search }, { replace: true });
    }
  };

  /*
   * Groups
   */
  const refreshGroups = () => {
    let tasks = [getGroups()];
    if (isEnterprise) {
      tasks.push(getDynamicGroups());
    }
    return Promise.all(tasks).catch(console.log);
  };

  const removeCurrentGroup = () => {
    const request = groupFilters.length ? removeDynamicGroup(selectedGroup) : removeStaticGroup(selectedGroup);
    return request.then(toggleGroupRemoval).catch(console.log);
  };

  // Edit groups from device selection
  const addDevicesToGroup = tmpDevices => {
    // (save selected devices in state, open dialog)
    setTmpDevices(tmpDevices);
    setModifyGroupDialog(!modifyGroupDialog);
  };

  const createGroupFromDialog = (devices, group) => {
    let request = fromFilters ? addDynamicGroup(group, filters) : addStaticGroup(group, devices);
    return request.then(() => {
      // reached end of list
      setCreateGroupExplanation(false);
      setModifyGroupDialog(false);
      setFromFilters(false);
      refreshGroups();
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
    setOpenIdDialog(!openIdDialog);
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

  const toggleGroupRemoval = () => setRemoveGroup(!removeGroup);

  const toggleMakeGatewayClick = () => setShowMakeGateway(!showMakeGateway);

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
          groups={groupsById}
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
  getDynamicGroups,
  getGroups,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  setShowConnectingDialog,
  setSnackbar,
  setYesterday,
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
    groups: Object.keys(state.devices.groups.byId).sort(),
    groupsById: state.devices.groups.byId,
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
