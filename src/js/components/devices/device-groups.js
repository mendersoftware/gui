import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';

import AuthorizedDevices from './authorized-devices';
import CreateGroup from './create-group';
import Groups from './groups';
import RemoveGroup from './remove-group';
import {
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
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
import { getDocsVersion, getIsEnterprise, getLimitMaxed } from '../../selectors';
import CreateGroupExplainer from './create-group-explainer';
import Global from '../settings/global';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { emptyFilter } from './filters';
import PreauthDialog, { DeviceLimitWarning } from './preauth-dialog';
import {
  AcceptedEmptyState,
  DeviceCreationTime,
  DeviceExpansion,
  DeviceStatusHeading,
  PendingEmptyState,
  PreauthorizedEmptyState,
  RejectedEmptyState,
  RelativeDeviceTime
} from './base-devices';
import DeviceAdditionWidget from './deviceadditionwidget';
import QuickFilter from './quickfilter';
import DeviceStatusNotification from './devicestatusnotification';

const defaultHeaders = {
  deviceCreationTime: {
    title: 'First request',
    attribute: { name: 'created_ts', scope: 'system' },
    render: DeviceCreationTime,
    sortable: true
  },
  deviceStatus: {
    title: 'Status',
    attribute: { name: 'status', scope: 'identity' },
    render: DeviceStatusHeading,
    sortable: true
  },
  deviceExpansion: {
    title: '',
    attribute: {},
    render: DeviceExpansion,
    sortable: false
  },
  lastCheckIn: {
    title: 'Last check-in',
    attribute: { name: 'updated_ts', scope: 'system' },
    render: RelativeDeviceTime,
    sortable: true
  }
};

const acceptedDevicesRoute = {
  key: DEVICE_STATES.accepted,
  groupRestricted: false,
  route: '/devices',
  title: () => 'Accepted',
  emptyState: AcceptedEmptyState,
  defaultHeaders: [
    {
      title: 'Device type',
      attribute: { name: 'device_type', scope: 'inventory' },
      render: device => (device.attributes && device.attributes.device_type ? device.attributes.device_type : '-'),
      sortable: true
    },
    {
      title: 'Current software',
      attribute: { name: 'rootfs-image.version', scope: 'inventory', alternative: 'artifact_name' },
      render: ({ attributes = {} }) => attributes['rootfs-image.version'] || attributes.artifact_name || '-',
      sortable: true
    },
    defaultHeaders.lastCheckIn,
    defaultHeaders.deviceStatus,
    defaultHeaders.deviceExpansion
  ]
};

export const routes = {
  allDevices: {
    ...acceptedDevicesRoute,
    key: 'any',
    title: () => 'Any'
  },
  devices: acceptedDevicesRoute,
  [DEVICE_STATES.accepted]: acceptedDevicesRoute,
  [DEVICE_STATES.pending]: {
    key: DEVICE_STATES.pending,
    groupRestricted: true,
    route: '/devices/pending',
    title: count => `Pending${count ? ` (${count})` : ''}`,
    emptyState: PendingEmptyState,
    defaultHeaders: [defaultHeaders.deviceCreationTime, defaultHeaders.lastCheckIn, defaultHeaders.deviceStatus, defaultHeaders.deviceExpansion]
  },
  [DEVICE_STATES.preauth]: {
    key: DEVICE_STATES.preauth,
    groupRestricted: true,
    route: '/devices/preauthorized',
    title: () => 'Preauthorized',
    emptyState: PreauthorizedEmptyState,
    defaultHeaders: [
      {
        ...defaultHeaders.deviceCreationTime,
        title: 'Date added'
      },
      defaultHeaders.deviceStatus,
      defaultHeaders.deviceExpansion
    ]
  },
  [DEVICE_STATES.rejected]: {
    key: DEVICE_STATES.rejected,
    groupRestricted: true,
    route: '/devices/rejected',
    title: () => 'Rejected',
    emptyState: RejectedEmptyState,
    defaultHeaders: [defaultHeaders.deviceCreationTime, defaultHeaders.lastCheckIn, defaultHeaders.deviceStatus, defaultHeaders.deviceExpansion]
  }
};

export const sortingAlternatives = Object.values(routes)
  .reduce((accu, item) => [...accu, ...item.defaultHeaders], [])
  .reduce((accu, item) => {
    if (item.attribute.alternative) {
      accu[item.attribute.name] = item.attribute.alternative;
      accu[item.attribute.alternative] = item.attribute.name;
    }
    return accu;
  }, {});

export const convertQueryToFilterAndGroup = (query, filteringAttributes) => {
  const search = query.startsWith('?') ? query.substring(1) : query;
  const str = decodeURIComponent(search);
  const filters = str.split('&').reduce(
    (accu, filter) => {
      const filterPair = filter.split('=');
      let scope = {};
      if (filterPair[0] === 'group') {
        accu.groupName = filterPair[1];
        return accu;
      } else if (filterPair[0] === 'id') {
        scope = { scope: 'identity' };
      } else {
        scope = Object.entries(filteringAttributes).reduce(
          (accu, [attributesType, attributes]) => {
            if (attributes.includes(filterPair[0])) {
              accu.scope = attributesType.substring(0, attributesType.indexOf('Attr'));
            }
            return accu;
          },
          { scope: emptyFilter.scope }
        );
      }
      accu.filters.push({ ...emptyFilter, ...scope, key: filterPair[0], value: filterPair[1] });
      return accu;
    },
    { filters: [], groupName: '' }
  );
  return filters;
};

let deviceTimer;

export const DeviceGroups = ({
  acceptedCount,
  addDynamicGroup,
  addStaticGroup,
  deviceLimit,
  deviceListState,
  docsVersion,
  filters,
  getDynamicGroups,
  getGroups,
  groupCount,
  groupFilters,
  groups,
  groupsById,
  history,
  identityAttributes,
  isEnterprise,
  limitMaxed,
  pendingCount,
  selectedGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  setShowConnectingDialog,
  showHelptips,
  preauthDevice,
  setSnackbar
}) => {
  const [createGroupExplanation, setCreateGroupExplanation] = useState(false);
  const [deviceRefreshTrigger, setDeviceRefreshTrigger] = useState(false);
  const [fromFilters, setFromFilters] = useState(false);
  const [modifyGroupDialog, setModifyGroupDialog] = useState(false);
  const [openIdDialog, setOpenIdDialog] = useState(false);
  const [openPreauth, setOpenPreauth] = useState(false);
  const [removeGroup, setRemoveGroup] = useState(false);
  const [tmpDevices, setTmpDevices] = useState([]);
  const [quickFilterResetTrigger, setQuickFilterResetTrigger] = useState(false);

  const { state: selectedState } = deviceListState;

  useEffect(() => {
    refreshGroups();
  }, []);

  useEffect(() => {
    refreshGroups();
  }, [groupCount]);

  /*
   * Groups
   */
  const refreshGroups = () => {
    let tasks = [getGroups()];
    if (isEnterprise) {
      tasks.push(getDynamicGroups());
    }
    return Promise.all(tasks).catch(err => console.log(err));
  };

  const handleGroupChange = group => {
    selectGroup(group);
    history.push(group ? `/devices?group=${group}` : '/devices');
  };

  const removeCurrentGroup = () => {
    const request = groupFilters.length ? removeDynamicGroup(selectedGroup) : removeStaticGroup(selectedGroup);
    return request.then(() => setRemoveGroup(!removeGroup)).catch(err => console.log(err));
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
    if (selectedGroup) {
      return updateDynamicGroup(selectedGroup, filters);
    }
    setModifyGroupDialog(true);
    setFromFilters(true);
  };

  const onRemoveDevicesFromGroup = devices => {
    clearInterval(deviceTimer);
    const isGroupRemoval = devices.length >= groupCount;
    let request;
    if (isGroupRemoval) {
      request = removeStaticGroup(selectedGroup);
    } else {
      request = removeDevicesFromGroup(selectedGroup, devices);
    }
    return request.catch(err => console.log(err));
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
    setDeviceRefreshTrigger(!deviceRefreshTrigger);
  };

  const onFilterDevices = (value, key) => {
    setDeviceListState({ state: routes.allDevices.key });
    setDeviceFilters([{ scope: 'identity', key, operator: '$eq', value }]);
  };

  const onClearSearchClick = () => {
    setQuickFilterResetTrigger(!quickFilterResetTrigger);
  };

  const onShowDeviceStateClick = state => {
    setDeviceListState({ state });
    selectGroup();
  };

  return (
    <>
      <div className="flexbox space-between margin-right">
        <div className="flexbox padding-top-small">
          <h3 style={{ minWidth: 300, marginTop: 0 }}>Devices</h3>
          <QuickFilter attributes={identityAttributes} onChange={onFilterDevices} resetTrigger={quickFilterResetTrigger} />
        </div>
        <DeviceAdditionWidget docsVersion={docsVersion} onConnectClick={setShowConnectingDialog} onPreauthClick={setOpenPreauth} />
      </div>
      <div className="tab-container with-sub-panels" style={{ padding: 0 }}>
        <div className="leftFixed">
          <Groups
            acceptedCount={acceptedCount}
            changeGroup={handleGroupChange}
            groups={groupsById}
            openGroupDialog={setCreateGroupExplanation}
            selectedGroup={selectedGroup}
            showHelptips={showHelptips}
          />
        </div>
        <div className="rightFluid" style={{ paddingTop: '0' }}>
          {limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedCount} deviceLimit={deviceLimit} />}
          {!!pendingCount && !selectedGroup && selectedState !== DEVICE_STATES.pending && (
            <DeviceStatusNotification deviceCount={pendingCount} state={DEVICE_STATES.pending} onClick={onShowDeviceStateClick} />
          )}
          <AuthorizedDevices
            addDevicesToGroup={addDevicesToGroup}
            deviceRefreshTrigger={deviceRefreshTrigger}
            onGroupClick={onGroupClick}
            onGroupRemoval={() => setRemoveGroup(!removeGroup)}
            onPreauthClick={setOpenPreauth}
            onClearSearchClick={onClearSearchClick}
            openSettingsDialog={openSettingsDialog}
            removeDevicesFromGroup={onRemoveDevicesFromGroup}
            states={routes}
          />
        </div>
        {removeGroup && <RemoveGroup onClose={() => setRemoveGroup(!removeGroup)} onRemove={removeCurrentGroup} />}
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
      </div>
    </>
  );
};

const actionCreators = {
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
  preauthDevice,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  setDeviceFilters,
  setDeviceListState,
  setShowConnectingDialog,
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
  const deviceIdAttribute = { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 };
  let identityAttributes = [
    deviceIdAttribute,
    ...state.devices.filteringAttributes.identityAttributes.map(item => ({ key: item, value: item, scope: 'identity', category: 'identity', priority: 1 }))
  ];
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    deviceLimit: state.devices.limit,
    deviceListState: state.devices.deviceList,
    docsVersion: getDocsVersion(state),
    filters: state.devices.filters || [],
    groups: Object.keys(state.devices.groups.byId).sort(),
    groupsById: state.devices.groups.byId,
    groupCount,
    groupFilters,
    identityAttributes,
    isEnterprise: getIsEnterprise(state),
    limitMaxed: getLimitMaxed(state),
    pendingCount: state.devices.byStatus.pending.total || 0,
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceGroups);
