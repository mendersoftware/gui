import React from 'react';
import Time from 'react-time';

// material ui
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import RelativeTime from '../common/relative-time';

const columnData = [
  { id: 'email', disablePadding: false, label: 'Email' },
  { id: 'created_ts', disablePadding: false, label: 'Date created' },
  { id: 'updated_ts', disablePadding: false, label: 'Last updated' },
  { id: 'actions', disablePadding: false, label: 'Manage' }
];

const UserList = ({ users, currentUser, editUser, removeUser }) => (
  <div className="margin-top-small">
    <div style={{ marginLeft: '20px' }}>
      <h2 className="margin-top-small">Users</h2>
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
          {users.map((user, index) => (
            <TableRow key={user.id || index} hover>
              <TableCell>{user.email}</TableCell>
              <TableCell align="left">
                <Time value={user.created_ts} format="YYYY-MM-DD HH:mm" />
              </TableCell>
              <TableCell align="left">
                <RelativeTime updateTime={user.updated_ts} />
              </TableCell>
              <TableCell padding="none">
                <Button onClick={() => editUser(user)}>Edit</Button>
                {currentUser.id !== user.id ? <Button onClick={() => removeUser(user)}>Remove</Button> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default UserList;
