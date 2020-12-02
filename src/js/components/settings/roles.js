import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { createRole, editRole, getRoles, removeRole } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import RoleDefinition from './roledefinition';

export class RoleManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: false,
      allowUserManagement: false,
      editing: false,
      role: undefined
    };
    if (!props.groups.length) {
      props.getDynamicGroups();
      props.getGroups();
      props.getRoles();
    }
  }

  addRole() {
    this.setState({
      adding: true,
      editing: false,
      role: undefined,
      allowUserManagement: false
    });
  }

  editRole(role) {
    this.setState({
      adding: false,
      editing: true,
      role,
      allowUserManagement: role.allowUserManagement
    });
  }

  removeRole(roleId) {
    this.props.removeRole(roleId);
    this.onCancel();
  }

  onCancel() {
    this.setState({
      adding: false,
      editing: false
    });
  }

  onSubmit(submittedRole) {
    const role = {
      ...submittedRole,
      allowUserManagement: this.state.allowUserManagement
    };
    if (this.state.adding) {
      this.props.createRole(role);
    } else {
      this.props.editRole(role);
    }
    this.onCancel();
  }

  render() {
    const self = this;
    const { adding, role } = self.state;
    const { roles } = self.props;
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
                  {role.editable && <Button onClick={() => self.editRole(role)}>Edit</Button>}
                  {role.editable && <Button onClick={() => self.removeRole(role.id)}>Remove</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!adding && <Chip className="margin-top-small" color="primary" icon={<AddIcon />} label="Add a role" onClick={() => self.addRole()} />}
        <RoleDefinition
          {...self.state}
          selectedRole={role}
          stateGroups={this.props.groups}
          onAllowUserManagementChange={allowUserManagement => self.setState({ allowUserManagement })}
          onCancel={() => self.onCancel()}
          onSubmit={role => self.onSubmit(role)}
        />
      </div>
    );
  }
}

const actionCreators = { createRole, editRole, getDynamicGroups, getGroups, getRoles, removeRole };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    groups: Object.keys(groups),
    isHosted: state.app.features.isHosted,
    org: state.organization.organization,
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role }))
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
