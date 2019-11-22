import React from 'react';
import Time from 'react-time';

// material ui
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

const columnData = [
  { id: 'email', disablePadding: false, label: 'Email' },
  { id: 'created_ts', disablePadding: false, label: 'Date created' },
  { id: 'updated_ts', disablePadding: false, label: 'Last updated' },
  { id: 'actions', disablePadding: false, label: 'Manage' }
];

export default class UserList extends React.PureComponent {
  render() {
    return (
      <div className="margin-top-small">
        <div style={{ marginLeft: '20px' }}>
          <h2 style={{ marginTop: '15px' }}>Users</h2>
        </div>
        <div className="margin-bottom">
          <Table>
            <TableHead>
              <TableRow>
                {columnData.map(column => (
                  <TableCell key={column.id} padding={column.disablePadding ? 'none' : 'default'}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.users.map((user, index) => (
                <TableRow key={user.id || index} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="left">
                    <Time value={user.created_ts} format="YYYY-MM-DD HH:mm" />
                  </TableCell>
                  <TableCell align="left">
                    <Time value={user.updated_ts} format="YYYY-MM-DD HH:mm" />
                  </TableCell>
                  <TableCell padding="none">
                    <Button onClick={() => this.props.editUser(user)}>Edit</Button>
                    {this.props.currentUser.id !== user.id ? <Button onClick={() => this.props.removeUser(user)}>Remove</Button> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}
