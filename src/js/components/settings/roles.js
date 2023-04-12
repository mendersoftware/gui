import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Add as AddIcon, ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';

import { getDynamicGroups, getGroups } from '../../actions/deviceActions';
import { createRole, editRole, getRoles, removeRole } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { emptyRole, rolesById } from '../../constants/userConstants';
import DetailsTable from '../common/detailstable';
import RoleDefinition from './roledefinition';

const columns = [
  { key: 'name', title: 'Role', render: ({ name }) => name },
  { key: 'description', title: 'Description', render: ({ description }) => description || '-' },
  {
    key: 'manage',
    title: 'Manage',
    render: () => (
      <div className="bold flexbox center-aligned link-color margin-right-small uppercased" style={{ whiteSpace: 'nowrap' }}>
        view details <ArrowRightAltIcon />
      </div>
    )
  }
];

export const RoleManagement = ({ createRole, editRole, getDynamicGroups, getGroups, getRoles, groups, releaseTags, removeRole, roles }) => {
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

  const items = useMemo(
    () =>
      Object.keys(rolesById)
        .reverse()
        .reduce((accu, key) => {
          const index = accu.findIndex(({ id }) => id === key);
          accu = [accu[index], ...accu.filter((item, itemIndex) => index !== itemIndex)];
          return accu;
        }, roles),
    [JSON.stringify(roles)]
  );

  return (
    <div>
      <h2 style={{ marginLeft: 20 }}>Roles</h2>
      <DetailsTable columns={columns} items={items} onItemClick={onEditRole} />
      <Chip color="primary" icon={<AddIcon />} label="Add a role" onClick={addRole} />
      <RoleDefinition
        adding={adding}
        editing={editing}
        onCancel={onCancel}
        onSubmit={onSubmit}
        removeRole={removeRole}
        selectedRole={role}
        stateGroups={groups}
        stateReleaseTags={releaseTags}
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
    releaseTags: state.releases.releaseTags.reduce((accu, key) => ({ ...accu, [key]: key }), {}),
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role }))
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
