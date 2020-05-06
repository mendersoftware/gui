import React from 'react';
import { connect } from 'react-redux';
// material ui
import {
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';

export class RoleManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      adding: false,
      groups: props.groups.map(group => ({ name: group, selected: false }))
    };
  }

  onSubmit() {
    this.setState({ adding: false });
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

  render() {
    const self = this;
    const { adding, description, groups, name } = self.state;
    const { roles } = self.props;
    return (
      <div>
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
        {adding ? (
          <div>
            <h4>Add a role</h4>
            <div>
              <TextField className="margin-right-large" label="Role name" id="role-name" value={name} onChange={e => self.setState({ name: e.target.value })} />
              <FormControl>
                <InputLabel htmlFor="artifact-description">Description</InputLabel>
                <Input id="role-description" type="text" value={description} onChange={e => self.setState({ description: e.target.value })} />
              </FormControl>
              <div>
                <FormControlLabel
                  control={<Checkbox color="secondary" onChange={(e, checked) => self.setState({ allowUserManagement: checked })} />}
                  label="Allow to manage other users"
                />
              </div>
              <div className="flexbox column">
                <h4>Device group permission</h4>
                {groups.map(group => (
                  <FormControlLabel
                    style={{ marginTop: 0, marginLeft: 0 }}
                    key={group.name}
                    control={<Checkbox color="secondary" checked={group.selected} onChange={(e, checked) => self.handleGroupSelection(checked, group)} />}
                    label={group.name}
                  />
                ))}
              </div>
            </div>
            <div className="flexbox">
              <Button
                onClick={() =>
                  self.setState({
                    adding: false,
                    allowUserManagement: false,
                    description: '-',
                    groups: self.props.groups.map(group => ({ name: group, selected: false })),
                    name: ''
                  })
                }
              >
                Cancel
              </Button>
              <Button color="primary" variant="contained" onClick={() => self.onSubmit()}>
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <Chip className="margin-top-small" color="primary" icon={<AddIcon />} label="Add a role" onClick={() => self.setState({ adding: true })} />
        )}
      </div>
    );
  }
}

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    groups: Object.keys(state.devices.groups.byId),
    roles: state.users.roles
  };
};

export default connect(mapStateToProps, actionCreators)(RoleManagement);
