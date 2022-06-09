import React, { useEffect, useState, useMemo } from 'react';
import validator from 'validator';

// material ui
import { Button, Checkbox, Divider, Drawer, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { Close as CloseIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/styles';

import { ALL_DEVICES } from '../../constants/deviceConstants';
import { emptyUiPermissions, emptyRole, uiPermissionsById, uiPermissionsByArea, rolesById } from '../../constants/userConstants';
import { deepCompare, isEmpty } from '../../helpers';

const menuProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left'
  }
};

const PermissionsSelect = ({ disabled, label, onChange, options, values }) => {
  const theme = useTheme();

  const permissionEnabledDisabled = (uiPermission, values) => {
    const { permissionLevel, value: permissionValue } = uiPermission;
    const disabled = values.some(permission => uiPermissionsById[permission].permissionLevel > permissionLevel);
    const enabled = values.some(permission => permission === permissionValue) || disabled;
    return { enabled, disabled };
  };

  const onInputChange = ({ target: { value } }) => {
    if (value.includes('')) {
      return onChange([]);
    }
    return onChange(value);
  };

  const { editablePermissions, selectedValues } = useMemo(
    () =>
      options.reduce(
        (accu, uiPermission) => {
          const { enabled, disabled } = permissionEnabledDisabled(uiPermission, values);
          accu.editablePermissions.push({ enabled, disabled, ...uiPermission });
          if (enabled) {
            accu.selectedValues.push(uiPermission.value);
          }
          return accu;
        },
        { editablePermissions: [], selectedValues: [] }
      ),
    [options, values]
  );

  return (
    <FormControl>
      <InputLabel id="permission-selection-label">{label && !values.length ? label : ''}</InputLabel>
      <Select
        labelId="permission-selection-label"
        disabled={disabled}
        displayEmpty={!label}
        fullWidth
        MenuProps={menuProps}
        multiple
        onChange={onInputChange}
        renderValue={() => (selectedValues.length ? selectedValues.map(value => uiPermissionsById[value].title).join(', ') : 'None')}
        value={values}
      >
        {editablePermissions.map(uiPermission => (
          <MenuItem disabled={uiPermission.disabled} key={uiPermission.value} value={uiPermission.value}>
            <Checkbox checked={uiPermission.enabled} disabled={uiPermission.disabled} style={{ marginLeft: theme.spacing(-1.5) }} />
            <div className={uiPermission.disabled ? 'text-muted' : ''}>{uiPermission.title}</div>
          </MenuItem>
        ))}
        <MenuItem value="">None</MenuItem>
      </Select>
    </FormControl>
  );
};

const PermissionsAreaTitle = ({ className = '', explanation, title }) => (
  <div className={`flexbox center-aligned margin-top ${className}`}>
    {title}
    <Tooltip arrow placement="bottom" title={explanation}>
      <InfoOutlinedIcon className="margin-left-small muted" fontSize="small" />
    </Tooltip>
  </div>
);

const PermissionsItem = ({ area, ...remainder }) => (
  <>
    <PermissionsAreaTitle title={area.title} explanation={area.explanation} />
    <PermissionsSelect options={area.uiPermissions} {...remainder} />
  </>
);

const GroupSelection = ({ disableEdit, groups, groupSelection, index, onGroupSelect, onGroupPermissionSelect }) => (
  <div className="flexbox center-aligned margin-left">
    <div className="two-columns center-aligned" style={{ maxWidth: 500 }}>
      {disableEdit ? (
        // empty label as a shortcut to align the layout with the select path
        <TextField disabled defaultValue={groupSelection.group} label=" " />
      ) : (
        <FormControl>
          <InputLabel id="permissions-group-selection-label">{!groupSelection.group ? 'Search groups' : ''}</InputLabel>
          <Select labelId="permissions-group-selection-label" onChange={e => onGroupSelect(index, e)} value={groupSelection.group}>
            {groups.map(group => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <PermissionsSelect
        disabled={disableEdit}
        label="Select"
        onChange={selectedPermissions => onGroupPermissionSelect(index, selectedPermissions)}
        options={uiPermissionsByArea.groups.uiPermissions}
        values={groupSelection.uiPermissions}
      />
    </div>
    {groupSelection.group === ALL_DEVICES && (
      <div className="margin-left text-muted" style={{ alignSelf: 'flex-end' }}>
        For &apos;All devices&apos;, users with the Manage permission may also create, edit and delete devices groups.
      </div>
    )}
  </div>
);

const emptyGroupSelection = { group: '', uiPermissions: [], disableEdit: false };

const permissionMapper = uiPermission => uiPermissionsById[uiPermission].value;

const uiPermissionCompare = (existingPermissions, changedPermissions) => {
  return deepCompare(existingPermissions, changedPermissions);
};

export const RoleDefinition = ({ adding, editing, stateGroups, onCancel, onSubmit, removeRole, selectedRole = { ...emptyRole } }) => {
  const [description, setDescription] = useState(selectedRole.description);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState(selectedRole.name);
  const [nameError, setNameError] = useState(false);

  const [releasesPermissions, setReleasesPermissions] = useState([]);
  const [userManagementPermissions, setUserManagementPermissions] = useState([]);
  const [auditlogPermissions, setAuditlogPermissions] = useState([]);
  const [groupSelections, setGroupSelections] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const { name: roleName = '', description: roleDescription = '' } = selectedRole;
    const { auditlog, groups: roleGroups = {}, releases, userManagement } = { ...emptyUiPermissions, ...selectedRole.uiPermissions };
    const disableEdit = editing && Boolean(rolesById[roleName] || !selectedRole.editable);
    setName(roleName);
    setDescription(roleDescription);
    setUserManagementPermissions(userManagement.map(permissionMapper));
    setReleasesPermissions(releases.map(permissionMapper));
    setAuditlogPermissions(auditlog.map(permissionMapper));
    let filteredStateGroups = groupsFilter(stateGroups);
    let groupSelections = Object.entries(roleGroups).map(([group, groupUiPermissions]) => ({
      ...emptyGroupSelection,
      group,
      uiPermissions: groupUiPermissions.map(permissionMapper)
    }));
    if (!adding && !groupSelections.length && filteredStateGroups.length !== Object.keys(stateGroups).length && !isEmpty(roleGroups)) {
      filteredStateGroups = Object.keys(roleGroups);
      groupSelections = Object.keys(roleGroups).map(group => ({
        group,
        uiPermissions: [uiPermissionsById.read.value, uiPermissionsById.manage.value],
        disableEdit: true
      }));
    } else if (!disableEdit) {
      groupSelections.push(emptyGroupSelection);
    }
    setGroups(filteredStateGroups);
    setGroupSelections(groupSelections);
  }, [adding, editing, selectedRole, stateGroups]);

  const groupsFilter = stateGroups =>
    Object.entries(stateGroups).reduce(
      (accu, [name, groupInfo]) => {
        if (!groupInfo.filters.length) {
          accu.push(name);
        }
        return accu;
      },
      [ALL_DEVICES]
    );

  const maybeExtendGroupSelection = (changedGroupSelection, currentGroup) => {
    if (changedGroupSelection.every(selection => selection.group && selection.uiPermissions.length)) {
      changedGroupSelection.push(emptyGroupSelection);
      return changedGroupSelection;
    }
    // the following is horrible, but I couldn't come up with a better solution that ensures only a single partly defined definition exists
    const filtered = changedGroupSelection.filter(selection => !((!selection.group || !selection.uiPermissions.length) && selection !== currentGroup));
    if (!filtered.some(selection => !selection.group || !selection.uiPermissions.length)) {
      filtered.push(emptyGroupSelection);
    }
    return filtered;
  };

  const onGroupSelect = (index, { target: { value } }) => {
    let changedGroups = [...groupSelections];
    changedGroups[index] = { ...changedGroups[index], group: value };
    changedGroups = maybeExtendGroupSelection(changedGroups, changedGroups[index]);
    setGroupSelections(changedGroups);
  };

  const onGroupPermissionSelect = (index, selectedPermissions) => {
    let changedGroups = [...groupSelections];
    changedGroups[index] = { ...changedGroups[index], uiPermissions: selectedPermissions };
    changedGroups = maybeExtendGroupSelection(changedGroups, changedGroups[index]);
    setGroupSelections(changedGroups);
  };

  const validateNameChange = ({ target: { value } }) => {
    setNameError(!(value && validator.isWhitelisted(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')));
    setName(value);
  };

  const onSubmitClick = () => {
    const allowUserManagement = userManagementPermissions.includes(uiPermissionsById.manage.value);
    const role = {
      source: selectedRole,
      allowUserManagement,
      description,
      name,
      uiPermissions: {
        auditlog: auditlogPermissions,
        groups: groupSelections,
        releases: releasesPermissions,
        userManagement: userManagementPermissions
      }
    };
    onSubmit(role);
  };

  const onRemoveRole = () => {
    removeRole(name);
    onCancel();
  };

  const disableEdit = editing && Boolean(rolesById[selectedRole.id] || !selectedRole.editable);
  const isSubmitDisabled = useMemo(() => {
    const filteredGroups = groupSelections.filter(selection => selection.group && selection.uiPermissions.length);
    const changedPermissions = {
      ...emptyUiPermissions,
      userManagement: userManagementPermissions,
      releases: releasesPermissions,
      auditlog: auditlogPermissions,
      groups: groupSelections.reduce((accu, item) => {
        if (item.group) {
          accu[item.group] = item.uiPermissions;
        }
        return accu;
      }, {})
    };
    return Boolean(
      disableEdit ||
        !name ||
        nameError ||
        !(userManagementPermissions.length || filteredGroups.length) ||
        (Object.entries({ description, name }).every(([key, value]) => selectedRole[key] === value) &&
          uiPermissionCompare(selectedRole.uiPermissions, changedPermissions))
    );
  }, [auditlogPermissions, description, disableEdit, groupSelections, name, nameError, releasesPermissions, userManagementPermissions]);

  return (
    <Drawer anchor="right" open={adding || editing} PaperProps={{ style: { minWidth: 600, width: '50vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <h3>{adding ? 'Add a' : 'Edit'} role</h3>
        <div className="flexbox center-aligned">
          {editing && !rolesById[selectedRole.id] && (
            <Button
              className="flexbox center-aligned"
              color="secondary"
              disabled={disableEdit}
              onClick={onRemoveRole}
              style={{ marginRight: theme.spacing(2) }}
            >
              delete role
            </Button>
          )}
          <IconButton onClick={onCancel} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />
      <div className="flexbox column" style={{ width: 500 }}>
        <FormControl>
          <TextField label="Name" id="role-name" value={name} disabled={disableEdit || editing} onChange={validateNameChange} />
          {nameError && <FormHelperText className="warning">Invalid character in role name. Valid characters are a-z, A-Z, 0-9, _ and -</FormHelperText>}
        </FormControl>
        <TextField
          disabled={disableEdit}
          label="Description"
          id="role-description"
          multiline
          placeholder="-"
          onChange={e => setDescription(e.target.value)}
          value={description}
        />
      </div>

      <InputLabel className="margin-top" shrink>
        Permissions
      </InputLabel>
      <div className="two-columns center-aligned margin-left-small" style={{ maxWidth: 500 }}>
        <PermissionsItem
          area={uiPermissionsByArea.userManagement}
          disabled={disableEdit}
          onChange={setUserManagementPermissions}
          values={userManagementPermissions}
        />
        <PermissionsItem disabled={disableEdit} area={uiPermissionsByArea.auditlog} onChange={setAuditlogPermissions} values={auditlogPermissions} />
        <PermissionsItem disabled={disableEdit} area={uiPermissionsByArea.releases} onChange={setReleasesPermissions} values={releasesPermissions} />
      </div>

      {(!disableEdit || !!groupSelections.length) && (
        <PermissionsAreaTitle className="margin-left-small" explanation={uiPermissionsByArea.groups.explanation} title={uiPermissionsByArea.groups.title} />
      )}
      {groupSelections.map((groupSelection, index) => (
        <GroupSelection
          disableEdit={disableEdit || groupSelection.disableEdit}
          groups={groups}
          groupSelection={groupSelection}
          index={index}
          key={`${groupSelection.group}-${index}`}
          onGroupSelect={onGroupSelect}
          onGroupPermissionSelect={onGroupPermissionSelect}
        />
      ))}
      <Divider light style={{ marginTop: theme.spacing(4) }} />
      <div className="flexbox centered margin-top" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} style={{ marginRight: theme.spacing(2) }}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" target="_blank" disabled={isSubmitDisabled} onClick={onSubmitClick}>
          Submit
        </Button>
      </div>
    </Drawer>
  );
};

export default RoleDefinition;
