import React from 'react';
import { connect } from 'react-redux';
// material ui
import { Button, Checkbox, Chip, Collapse, FormControlLabel, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { PLANS as plans } from '../../constants/appConstants';

export class RoleManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: false,
      groups: props.groups.map(group => ({ name: group, selected: false })),
      description: undefined,
      name: undefined
    };
    if (!props.groups.length) {
      props.getDynamicGroups();
      props.getGroups();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.groups.length !== this.props.groups.length) {
      this.setState({ groups: this.props.groups.map(group => ({ name: group, selected: false })) });
    }
  }

  onSubmit() {
    this.onCancel();
  }

  onCancel() {
    this.setState({
      adding: false,
      allowUserManagement: false,
      description: undefined,
      groups: this.props.groups.map(group => ({ name: group, selected: false })),
      name: undefined
    });
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

  generateRequest() {
    const { isHosted, org } = this.props;
    const { allowUserManagement, description, groups, name } = this.state;
    const groupsList = groups
      .reduce((accu, group) => {
        if (group.selected) {
          accu.push(group.name);
        }
        return accu;
      }, [])
      .join(', ');
    const currentPlan = isHosted ? org && org.plan : 'enterprise';
    return encodeURIComponent(`
    Organization ID
    ${org.id}
    Organization name
    ${org.name}
    Plan name
    ${plans[currentPlan]}
    I would like to create a group with the following settings:
      name: ${name || ''},
      description: ${description || ''},
      allow managing other users: ${allowUserManagement ? 'Yes' : 'No'},
      groups: ${groupsList}`);
  }

  render() {
    const self = this;
    const { adding, description, groups, name } = self.state;
    const { org, roles } = self.props;
    const mailTrigger = `mailto:support@mender.io?subject=${org.name}: Create group&body=${self.generateRequest()}`;
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
                <TableCell>{role.editable && <Button onClick={role => self.onRemove(role)}>Remove</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!adding && <Chip className="margin-top-small" color="primary" icon={<AddIcon />} label="Add a role" onClick={() => self.setState({ adding: true })} />}
        <Collapse in={adding} className="margin-right-small filter-wrapper" classes={{ wrapperInner: 'margin-bottom-small margin-right' }}>
          <h4 style={{ marginTop: 5 }}>Add a role</h4>
          <TextField
            label="Role name"
            id="role-name"
            value={name}
            onChange={e => self.setState({ name: e.target.value })}
            style={{ marginTop: 0, marginRight: 30 }}
          />
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
              label="Allow to manage other users"
            />
          </div>
          {groups.length && (
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
            <Button color="secondary" variant="contained" href={mailTrigger} target="_blank" onClick={() => self.onCancel()}>
              Submit
            </Button>
          </div>
        </Collapse>
      </div>
    );
  }
}

const actionCreators = { getDynamicGroups, getGroups, setSnackbar };

const mapStateToProps = state => {
  return {
    groups: Object.keys(state.devices.groups.byId),
    isHosted: state.app.features.isHosted,
    org: state.users.organization,
    roles: Object.entries(state.users.rolesById).map(([id, role]) => ({ id, ...role }))
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
