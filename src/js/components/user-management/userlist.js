import React from 'react';

import AppStore from '../../stores/app-store';
import Time from 'react-time';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

const columnData = [
  { id: 'email', disablePadding: false, label: 'Email' },
  { id: 'created_ts', disablePadding: false, label: 'Date created' },
  { id: 'updated_ts', disablePadding: false, label: 'Last updated' },
  { id: 'actions', disablePadding: false, label: 'Manage' }
];

export default class UserList extends React.Component {
  _filter(array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
      if (AppStore.matchFilters(array[i])) newArray.push(array[i]);
    }
    return newArray;
  }

  _handleEdit(user, current) {
    this.props.editUser(user, current);
  }
  _handleRemove(user) {
    this.props.removeUser(user);
  }

  render() {
    var filteredUsers = this._filter(this.props.users);

    var users = filteredUsers.map(user => {
      return (
        <TableRow key={user.id} hover>
          <TableCell>{user.email}</TableCell>
          <TableCell align="left">
            <Time value={user.created_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell align="left">
            <Time value={user.updated_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell padding="none">
            <Button onClick={() => this._handleEdit(user)}>Edit</Button>
            {this.props.currentUser.id !== user.id ? <Button onClick={() => this._handleRemove(user)}>Remove</Button> : null}
          </TableCell>
        </TableRow>
      );
    });

    return (
      <div className="margin-top-small">
        <div style={{ marginLeft: '20px' }}>
          <h2 style={{ marginTop: '15px' }}>Users</h2>
        </div>
        <div className="margin-bottom">
          <Table>
            <TableHead>
              <TableRow>
                {columnData.map(column => {
                  return (
                    <TableCell key={column.id} padding={column.disablePadding ? 'none' : 'default'}>
                      {column.label}
                    </TableCell>
                  );
                }, this)}
              </TableRow>
            </TableHead>
            <TableBody>{users}</TableBody>
          </Table>
        </div>
      </div>
    );
  }
}
