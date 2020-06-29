import React from 'react';
import { connect } from 'react-redux';
import validator from 'validator';

// material ui
import {
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { createRole, editRole, getRoles, removeRole } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';

export class RoleManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: false,
      editing: false,
      allowUserManagement: false,
      groups: props.groups.map(group => ({ name: group, selected: false })),
      description: '',
      name: '',
      nameInput: ''
    };
    if (!props.groups.length) {
      props.getDynamicGroups();
      props.getGroups();
      props.getRoles();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.groups.length !== this.props.groups.length) {
      this.setState({ groups: this.props.groups.map(group => ({ name: group, selected: false })) });
    }
  }

  addRole() {
    this.setState({
      adding: true,
      editing: false,
      name: '',
      nameInput: '',
      description: '',
      allowUserManagement: false,
      groups: this.props.groups.map(group => ({ name: group, selected: false }))
    });
  }

  editRole(role) {
    this.setState({
      adding: false,
      editing: true,
      name: role.id,
      nameInput: role.id,
      description: role.description,
      allowUserManagement: role.allowUserManagement,
      groups: this.props.groups.map(group => ({ name: group, selected: role.groups.indexOf(group) !== -1 }))
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

  onSubmit() {
    const role = {
      allowUserManagement: this.state.allowUserManagement,
      name: this.state.name,
      description: this.state.description,
      groups: this.state.groups.reduce((accu, group) => {
        if (group.selected) {
          accu.push(group.name);
        }
        return accu;
      }, [])
    };
    if (this.state.adding) {
      this.props.createRole(role);
    } else {
      this.props.editRole(role);
    }
    this.onCancel();
  }

  handleGroupSelection(selected, group) {
    const { groups } = this.state;
    const groupIndex = groups.findIndex(currentGroup => currentGroup.name === group.name);
    if (groupIndex > -1) {
      groups[groupIndex].selected = selected;
    } else {
      groups.push({ ...group, selected });
    }
    this.setState({ groups });
  }

  validateNameChange(e) {
    const value = e.target.value;
    if (value && validator.isWhitelisted(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      this.setState({ name: value });
    } else {
      this.setState({ name: '' });
    }
    this.setState({ nameInput: value });
  }

  render() {
    const self = this;
    const { adding, editing, allowUserManagement, description, groups, name, nameInput } = self.state;
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
        <Collapse in={adding || editing} className="margin-right-small filter-wrapper" classes={{ wrapperInner: 'margin-bottom-small margin-right' }}>
          <h4 style={{ marginTop: 5 }}>{adding ? 'Add a' : 'Edit the'} role</h4>
          <FormControl style={{ marginTop: '0' }}>
            <TextField
              label="Role name"
              id="role-name"
              value={nameInput}
              disabled={editing}
              onChange={e => self.validateNameChange(e)}
              style={{ marginTop: 0, marginRight: 30 }}
            />
            {name != nameInput && <FormHelperText>Valid characters are a-z, A-Z, 0-9, _ and -</FormHelperText>}
          </FormControl>
          <TextField
            label="Description"
            id="role-description"
            value={description}
            placeholder="-"
            onChange={e => self.setState({ description: e.target.value })}
            style={{ marginTop: 0, marginRight: 30 }}
          />
          <div>
            <FormControlLabel
              control={<Checkbox color="primary" onChange={(e, checked) => self.setState({ allowUserManagement: checked })} />}
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
                  control={<Checkbox color="primary" checked={group.selected} onChange={(e, checked) => self.handleGroupSelection(checked, group)} />}
                  label={group.name}
                />
              ))}
            </div>
          )}
          <div className="flexbox centered" style={{ justifyContent: 'flex-end' }}>
            <Button onClick={() => self.onCancel()} style={{ marginRight: 15 }}>
              Cancel
            </Button>
            <Button
              color="secondary"
              variant="contained"
              target="_blank"
              disabled={!(name && (allowUserManagement || groups.some(group => group.selected)))}
              onClick={() => self.onSubmit()}
            >
              Submit
            </Button>
          </div>
        </Collapse>
      </div>
    );
  }
}

const actionCreators = { createRole, editRole, getDynamicGroups, getGroups, getRoles, removeRole, setSnackbar };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    groups: Object.keys(groups),
    isHosted: state.app.features.isHosted,
    org: state.users.organization,
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role }))
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
