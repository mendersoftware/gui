import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Add as AddIcon, ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';

import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { createRole, editRole, getRoles, removeRole } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { emptyRole } from '../../constants/userConstants';
import RoleDefinition from './roledefinition';

export const RoleManagement = ({ createRole, editRole, getDynamicGroups, getGroups, getRoles, groups, removeRole, roles }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState({ ...emptyRole });

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
    setRole({ ...emptyRole });
  };

  const onEditRole = editedRole => {
    setAdding(false);
    setEditing(true);
    setRole(editedRole);
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
            <TableCell>Description</TableCell>
            <TableCell>Manage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, index) => (
            <TableRow className="clickable" key={role.id || index} hover onClick={() => onEditRole(role)}>
              <TableCell>{role.title}</TableCell>
              <TableCell>{role.description || '-'}</TableCell>
              <TableCell>
                <div className="bold flexbox center-aligned link-color margin-right-small uppercased" style={{ whiteSpace: 'nowrap' }}>
                  view details <ArrowRightAltIcon />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Chip color="primary" icon={<AddIcon />} label="Add a role" onClick={addRole} />
      <RoleDefinition
        adding={adding}
        editing={editing}
        onCancel={onCancel}
        onSubmit={onSubmit}
        removeRole={removeRole}
        selectedRole={role}
        stateGroups={groups}
      />
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
