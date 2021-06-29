import React, { useMemo, useState } from 'react';
import pluralize from 'pluralize';

import { SvgIcon } from '@material-ui/core';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import {
  AddCircle as AddCircleIcon,
  CheckCircle as CheckCircleIcon,
  HeightOutlined as HeightOutlinedIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon
} from '@material-ui/icons';
import { mdiTrashCanOutline as TrashCan } from '@mdi/js';

import { DEVICE_DISMISSAL_STATE, DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';

const defaultActions = {
  accept: {
    icon: <CheckCircleIcon className="green" />,
    key: 'accept',
    title: pluralized => `Accept ${pluralized}`,
    action: ({ onAuthorizationChange, selection }) => onAuthorizationChange(selection, DEVICE_STATES.accepted)
  },
  dismiss: {
    icon: <HighlightOffOutlinedIcon className="red" />,
    key: 'dismiss',
    title: pluralized => `Dismiss ${pluralized}`,
    action: ({ onAuthorizationChange, selection }) => onAuthorizationChange(selection, DEVICE_DISMISSAL_STATE)
  },
  reject: {
    icon: <HighlightOffOutlinedIcon className="red" />,
    key: 'reject',
    title: pluralized => `Reject ${pluralized}`,
    action: ({ onAuthorizationChange, selection }) => onAuthorizationChange(selection, DEVICE_STATES.rejected)
  },
  addToGroup: {
    icon: <AddCircleIcon className="green" />,
    key: 'group-add',
    title: pluralized => `Add selected ${pluralized} to a group`,
    action: ({ onAddDevicesToGroup, selection }) => onAddDevicesToGroup(selection)
  },
  moveToGroup: {
    icon: <HeightOutlinedIcon className="rotated ninety" />,
    key: 'group-change',
    title: pluralized => `Move selected ${pluralized} to another group`,
    action: ({ onAddDevicesToGroup, selection }) => onAddDevicesToGroup(selection)
  },
  removeFromGroup: {
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={TrashCan} />
      </SvgIcon>
    ),
    key: 'group-remove',
    title: pluralized => `Remove selected ${pluralized} from this group`,
    action: ({ onRemoveDevicesFromGroup, selection }) => onRemoveDevicesFromGroup(selection)
  }
};

const defaultActionsList = [
  {
    ...defaultActions.dismiss,
    allowedStates: [DEVICE_STATES.accepted, DEVICE_STATES.pending, DEVICE_STATES.preauth, DEVICE_STATES.rejected]
  },
  {
    ...defaultActions.reject,
    allowedStates: [DEVICE_STATES.accepted, DEVICE_STATES.pending]
  },
  {
    ...defaultActions.accept,
    allowedStates: [DEVICE_STATES.pending]
  }
];

export const DeviceQuickActions = ({ devices, actionCallbacks, selectedGroup, selectedRows }) => {
  const [showActions, setShowActions] = useState(false);

  const actions = useMemo(() => {
    const deviceStates = Object.keys(
      selectedRows.reduce((accu, row) => {
        const device = devices[row];
        accu[device.status] = (accu[device.status] || 0) + 1;
        return accu;
      }, {})
    );
    let relevantActions = defaultActionsList.reduce((accu, action) => {
      if (deviceStates.every(state => action.allowedStates.includes(state))) {
        accu.push(action);
      }
      return accu;
    }, []);

    if (selectedGroup) {
      relevantActions.push(defaultActions.moveToGroup);
      if (selectedGroup !== UNGROUPED_GROUP.id) {
        relevantActions.push(defaultActions.removeFromGroup);
      }
    } else {
      relevantActions.push(defaultActions.addToGroup);
    }
    return relevantActions;
  }, [selectedRows]);

  const pluralized = pluralize('devices', selectedRows.length);
  return (
    <div className="flexbox fixedButtons">
      <div className="margin-right">
        {selectedRows.length} {pluralize('devices', selectedRows.length)} selected
      </div>
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
            onClick={() => action.action({ ...actionCallbacks, selection: selectedRows })}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

export default DeviceQuickActions;
