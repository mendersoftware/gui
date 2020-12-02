import React, { useState } from 'react';
import validator from 'validator';

// material ui
import { Button, Checkbox, Collapse, FormControl, FormControlLabel, FormHelperText, TextField } from '@material-ui/core';

export const RoleDefinition = ({ adding, editing, allowUserManagement, stateGroups, onAllowUserManagementChange, onCancel, onSubmit, selectedRole }) => {
  const { id = '', description: roleDescription = '', groups: selectedRoleGroups = [] } = selectedRole || {};
  const [groups, setGroups] = useState(stateGroups.map(group => ({ name: group, selected: selectedRoleGroups.includes(group) })));
  const [description, setDescription] = useState(roleDescription);
  const [name, setName] = useState(id);
  const [nameInput, setNameInput] = useState(id);

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
    if (value && validator.isWhitelisted(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      setName(value);
    } else {
      setName('');
    }
    setNameInput(value);
  };

  const onSubmitClick = () => {
    const role = {
      name,
      description,
      groups: groups.reduce((accu, group) => {
        if (group.selected) {
          accu.push(group.name);
        }
        return accu;
      }, [])
    };
    onSubmit(role);
  };

  return (
    <Collapse in={adding || editing} className="margin-right-small filter-wrapper" classes={{ wrapperInner: 'margin-bottom-small margin-right' }}>
      <h4 style={{ marginTop: 5 }}>{adding ? 'Add a' : 'Edit the'} role</h4>
      <FormControl style={{ marginTop: '0' }}>
        <TextField
          label="Role name"
          id="role-name"
          value={nameInput}
          disabled={editing}
          onChange={validateNameChange}
          style={{ marginTop: 0, marginRight: 30 }}
        />
        {name != nameInput && <FormHelperText>Valid characters are a-z, A-Z, 0-9, _ and -</FormHelperText>}
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
          control={<Checkbox color="primary" onChange={(e, checked) => onAllowUserManagementChange(checked)} />}
          checked={allowUserManagement}
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
        <Button
          color="secondary"
          variant="contained"
          target="_blank"
          disabled={!(name && (allowUserManagement || groups.some(group => group.selected)))}
          onClick={onSubmitClick}
        >
          Submit
        </Button>
      </div>
    </Collapse>
  );
};

export default RoleDefinition;
