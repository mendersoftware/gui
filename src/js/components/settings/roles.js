import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { createRole, editRole, getRoles, removeRole } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import RoleDefinition, { emptyRole } from './roledefinition';
import theme from './../../themes/mender-theme';

export const RoleManagement = ({ createRole, editRole, getDynamicGroups, getGroups, getRoles, groups, removeRole, roles }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(emptyRole);

  useEffect(() => {
    if (!Object.keys(groups).length) {
      getDynamicGroups();
      getGroups();
      getRoles();
    }
  }, []);

  const addRole = () => {
    setAdding(true);
    setEditing(false);
    setRole(emptyRole);
  };

  const onEditRole = editedRole => {
    setAdding(false);
    setEditing(true);
    setRole(editedRole);
  };

  const onRemoveRole = roleId => {
    removeRole(roleId);
    onCancel();
  };

  const onCancel = () => {
    setAdding(false);
    setEditing(false);
  };

  const onSubmit = submittedRole => {
    if (adding) {
      createRole(submittedRole);
    } else {
      editRole(submittedRole);
    }
    onCancel();
  };

  return (
    <div>
      <h2 style={{ marginLeft: 20 }}>Roles</h2>
      <Table className="margin-bottom">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>Manage users</TableCell>
            <TableCell>Device group permission</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Manage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, index) => (
            <TableRow key={role.id || index} hover>
              <TableCell>{role.title}</TableCell>
              <TableCell>{role.allowUserManagement ? 'Yes' : 'No'}</TableCell>
              <TableCell>{role.groups.length ? role.groups.join(', ') : 'All devices'}</TableCell>
              <TableCell>{role.description || '-'}</TableCell>
              <TableCell>
                {role.editable && !role.groups.some(group => groups[group]?.filters.length) && <Button onClick={() => onEditRole(role)}>Edit</Button>}
                {role.editable && <Button onClick={() => onRemoveRole(role.id)}>Remove</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!adding && <Chip color="primary" icon={<AddIcon />} label="Add a role" onClick={addRole} style={{ marginBottom: theme.spacing(2) }} />}
      <RoleDefinition adding={adding} editing={editing} onCancel={onCancel} onSubmit={onSubmit} selectedRole={role} stateGroups={groups} />
    </div>
  );
};

const actionCreators = { createRole, editRole, getDynamicGroups, getGroups, getRoles, removeRole };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    groups,
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role }))
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
