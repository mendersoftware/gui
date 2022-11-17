import React, { forwardRef, memo, useMemo, useState } from 'react';
import pluralize from 'pluralize';

import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import {
  AddCircle as AddCircleIcon,
  CheckCircle as CheckCircleIcon,
  HeightOutlined as HeightOutlinedIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { mdiTrashCanOutline as TrashCan } from '@mdi/js';

import GatewayIcon from '../../../../assets/img/gateway.svg';
import MaterialDesignIcon from '../../common/materialdesignicon';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../../constants/deviceConstants';
import { deepCompare, stringToBoolean } from '../../../helpers';

const defaultActions = {
  accept: {
    icon: <CheckCircleIcon className="green" />,
    key: 'accept',
    title: pluralized => `Accept ${pluralized}`,
    action: ({ onAuthorizationChange, selection }) => onAuthorizationChange(selection, DEVICE_STATES.accepted),
    checkRelevance: ({ device, userCapabilities: { canWriteDevices } }) =>
      canWriteDevices && [DEVICE_STATES.pending, DEVICE_STATES.rejected].includes(device.status)
  },
  dismiss: {
    icon: <RemoveCircleOutlineIcon className="red" />,
    key: 'dismiss',
    title: pluralized => `Dismiss ${pluralized}`,
    action: ({ onDeviceDismiss, selection }) => onDeviceDismiss(selection),
    checkRelevance: ({ device, userCapabilities: { canWriteDevices } }) =>
      canWriteDevices && [DEVICE_STATES.accepted, DEVICE_STATES.pending, DEVICE_STATES.preauth, DEVICE_STATES.rejected, 'noauth'].includes(device.status)
  },
  reject: {
    icon: <HighlightOffOutlinedIcon className="red" />,
    key: 'reject',
    title: pluralized => `Reject ${pluralized}`,
    action: ({ onAuthorizationChange, selection }) => onAuthorizationChange(selection, DEVICE_STATES.rejected),
    checkRelevance: ({ device, userCapabilities: { canWriteDevices } }) =>
      canWriteDevices && [DEVICE_STATES.accepted, DEVICE_STATES.pending].includes(device.status)
  },
  addToGroup: {
    icon: <AddCircleIcon className="green" />,
    key: 'group-add',
    title: pluralized => `Add selected ${pluralized} to a group`,
    action: ({ onAddDevicesToGroup, selection }) => onAddDevicesToGroup(selection),
    checkRelevance: ({ selectedGroup, userCapabilities: { canWriteDevices } }) => canWriteDevices && !selectedGroup
  },
  moveToGroup: {
    icon: <HeightOutlinedIcon className="rotated ninety" />,
    key: 'group-change',
    title: pluralized => `Move selected ${pluralized} to another group`,
    action: ({ onAddDevicesToGroup, selection }) => onAddDevicesToGroup(selection),
    checkRelevance: ({ selectedGroup, userCapabilities: { canWriteDevices } }) => canWriteDevices && !!selectedGroup
  },
  removeFromGroup: {
    icon: <MaterialDesignIcon path={TrashCan} />,
    key: 'group-remove',
    title: pluralized => `Remove selected ${pluralized} from this group`,
    action: ({ onRemoveDevicesFromGroup, selection }) => onRemoveDevicesFromGroup(selection),
    checkRelevance: ({ selectedGroup, userCapabilities: { canWriteDevices } }) => canWriteDevices && selectedGroup && selectedGroup !== UNGROUPED_GROUP.id
  },
  promoteToGateway: {
    icon: <GatewayIcon style={{ width: 20 }} />,
    key: 'promote-to-gateway',
    title: () => 'Promote to gateway',
    action: ({ onPromoteGateway, selection }) => onPromoteGateway(selection),
    checkRelevance: ({ device, features, tenantCapabilities: { isEnterprise } }) =>
      features.isHosted && isEnterprise && !stringToBoolean(device.attributes.mender_is_gateway) && device.status === DEVICE_STATES.accepted
  },
  createDeployment: {
    icon: <ReplayIcon />,
    key: 'create-deployment',
    title: pluralized => `Create deployment for this ${pluralized}`,
    action: ({ onCreateDeployment, selection }) => onCreateDeployment(selection),
    checkRelevance: ({ device, isSingleDevice, userCapabilities: { canDeploy, canReadReleases } }) =>
      canDeploy && canReadReleases && isSingleDevice && device && device.status === DEVICE_STATES.accepted
  }
};

export const DeviceQuickActions = (
  { actionCallbacks, devices, features, isSingleDevice = false, selectedGroup, selectedRows, tenantCapabilities, userCapabilities },
  ref
) => {
  const [showActions, setShowActions] = useState(false);

  const { actions, selectedDevices } = useMemo(() => {
    const selectedDevices = selectedRows.map(row => devices[row]);
    const actions = Object.values(defaultActions).reduce((accu, action) => {
      if (
        selectedDevices.every(
          device => device && action.checkRelevance({ device, features, isSingleDevice, selectedGroup, tenantCapabilities, userCapabilities })
        )
      ) {
        accu.push(action);
      }
      return accu;
    }, []);
    return { actions, selectedDevices };
  }, [devices, isSingleDevice, selectedRows, selectedGroup, JSON.stringify(tenantCapabilities), JSON.stringify(userCapabilities)]);

  const pluralized = pluralize('devices', selectedDevices.length);
  return (
    <div className="flexbox fixedButtons" ref={ref}>
      <div className="margin-right">{isSingleDevice ? 'Device actions' : `${selectedDevices.length} ${pluralized} selected`}</div>
      <SpeedDial
        ariaLabel="device-actions"
        className="margin-small"
        icon={<SpeedDialIcon />}
        onClose={() => setShowActions(false)}
        onOpen={setShowActions}
        open={Boolean(showActions)}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.key}
            aria-label={action.key}
            icon={action.icon}
            tooltipTitle={action.title(pluralized)}
            tooltipOpen
            onClick={() => action.action({ ...actionCallbacks, selection: selectedDevices })}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.selectedGroup != nextProps.selectedGroup) {
    return false;
  }
  return (
    deepCompare(prevProps.tenantCapabilities, nextProps.tenantCapabilities) &&
    deepCompare(prevProps.userCapabilities, nextProps.userCapabilities) &&
    deepCompare(prevProps.selectedRows, nextProps.selectedRows)
  );
};

export default memo(forwardRef(DeviceQuickActions), areEqual);
