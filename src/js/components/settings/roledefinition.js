import React, { useEffect, useState } from 'react';
import validator from 'validator';

// material ui
import { Button, Checkbox, Collapse, FormControl, FormControlLabel, FormHelperText, TextField } from '@material-ui/core';

export const emptyRole = { allowUserManagement: false, id: '', description: '', groups: [] };

export const RoleDefinition = ({ adding, editing, stateGroups, onCancel, onSubmit, selectedRole = emptyRole }) => {
  const [allowUserManagement, setAllowUserManagement] = useState(selectedRole.allowUserManagement);
  const [description, setDescription] = useState(selectedRole.description);
  const [groups, setGroups] = useState(stateGroups.map(group => ({ name: group, selected: selectedRole.groups.includes(group) })));
  const [id, setId] = useState(selectedRole.id);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    const { allowUserManagement: roleAllowUserManagement = false, id = '', description: roleDescription = '', groups: selectedRoleGroups = [] } = selectedRole;
    setAllowUserManagement(roleAllowUserManagement);
    setDescription(roleDescription);
    setGroups(stateGroups.map(group => ({ name: group, selected: selectedRoleGroups.includes(group) })));
    setId(id);
  }, [stateGroups, selectedRole]);

  const handleGroupSelection = (selected, group) => {
    let groupsCopy = [...groups];
    const groupIndex = groups.findIndex(currentGroup => currentGroup.name === group.name);
    if (groupIndex > -1) {
      groupsCopy[groupIndex].selected = selected;
    } else {
      groupsCopy.push({ ...group, selected });
    }
    setGroups(groupsCopy);
  };

  const validateNameChange = ({ target: { value } }) => {
    setNameError(!(value && validator.isWhitelisted(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')));
    setId(value);
  };

  const onSubmitClick = () => {
    const role = {
      allowUserManagement,
      description,
      groups: groups.reduce((accu, group) => {
        if (group.selected) {
          accu.push(group.name);
        }
        return accu;
      }, []),
      name: id
    };
    onSubmit(role);
  };

  const filteredGroups = groups.filter(group => group.selected);
  const isSubmitDisabled = Boolean(
    nameError ||
      !(allowUserManagement || filteredGroups.length) ||
      (Object.entries({ allowUserManagement, description, id }).every(([key, value]) => selectedRole[key] === value) &&
        groups.length &&
        filteredGroups.length === selectedRole.groups.length &&
        filteredGroups.every(group => selectedRole.groups.includes(group.name)))
  );

  return (
    <Collapse in={adding || editing} className="margin-right-small filter-wrapper" classes={{ wrapperInner: 'margin-bottom-small margin-right' }}>
      <h4 style={{ marginTop: 5 }}>{adding ? 'Add a' : 'Edit the'} role</h4>
      <FormControl style={{ marginTop: '0' }}>
        <TextField label="Role name" id="role-name" value={id} disabled={editing} onChange={validateNameChange} style={{ marginTop: 0, marginRight: 30 }} />
        {nameError && <FormHelperText className="warning">Invalid character in role name. Valid characters are a-z, A-Z, 0-9, _ and -</FormHelperText>}
      </FormControl>
      <TextField
        label="Description"
        id="role-description"
        value={description}
        placeholder="-"
        onChange={e => setDescription(e.target.value)}
        style={{ marginTop: 0, marginRight: 30 }}
      />
      <div>
        <FormControlLabel
          control={<Checkbox color="primary" checked={allowUserManagement} onChange={(e, checked) => setAllowUserManagement(checked)} />}
          label="Allow to manage other users"
        />
      </div>
      {!!groups.length && (
        <div className="flexbox column margin-top-small">
          <div>Device group permission</div>
          {groups.map(group => (
            <FormControlLabel
              style={{ marginTop: 0, marginLeft: 0 }}
              key={group.name}
              control={<Checkbox color="primary" checked={group.selected} onChange={(e, checked) => handleGroupSelection(checked, group)} />}
              label={group.name}
            />
          ))}
        </div>
      )}
      <div className="flexbox centered" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} style={{ marginRight: 15 }}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" target="_blank" disabled={isSubmitDisabled} onClick={onSubmitClick}>
          Submit
        </Button>
      </div>
    </Collapse>
  );
};

export default RoleDefinition;
