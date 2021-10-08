import React from 'react';
import Time from 'react-time';
import LocaleFormatString from '../common/timeformat';

// material ui
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import RelativeTime from '../common/relative-time';

const columnData = [
  { id: 'email', disablePadding: false, label: 'Email', enterpriseOnly: false },
  { id: 'created_ts', disablePadding: false, label: 'Date created', enterpriseOnly: false },
  { id: 'updated_ts', disablePadding: false, label: 'Last updated', enterpriseOnly: false },
  { id: 'roles', disablePadding: false, label: 'Role', enterpriseOnly: true },
  { id: 'actions', disablePadding: false, label: 'Manage', enterpriseOnly: false }
];

const UserList = ({ currentUser, editUser, isAdmin: isAdminCurrentUser, isEnterprise, removeUser, roles, users }) => (
  <Table>
    <TableHead>
      <TableRow>
        {columnData.reduce((accu, column) => {
          if (column.enterpriseOnly && !isEnterprise) {
            return accu;
          }
          accu.push(
            <TableCell key={column.id} padding={column.disablePadding ? 'none' : 'default'}>
              {column.label}
            </TableCell>
          );
          return accu;
        }, [])}
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user, index) => (
        <TableRow key={user.id || index} hover>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <Time value={user.created_ts} format={LocaleFormatString()} />
          </TableCell>
          <TableCell>
            <RelativeTime updateTime={user.updated_ts} />
          </TableCell>
          {isEnterprise && <TableCell>{(user.roles || []).map(role => (roles.find(currentRole => currentRole.id === role) || {}).title).join(', ')}</TableCell>}
          <TableCell>
            <Button onClick={() => editUser(user)} style={{ marginLeft: -10 }}>
              Edit
            </Button>
            {currentUser.id !== user.id && isAdminCurrentUser ? <Button onClick={() => removeUser(user)}>Remove</Button> : null}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default UserList;
