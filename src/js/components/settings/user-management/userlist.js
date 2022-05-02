import React from 'react';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';

import Time, { RelativeTime } from '../../common/time';

const columnData = [
  { id: 'email', disablePadding: false, label: 'Email', enterpriseOnly: false },
  { id: 'created_ts', disablePadding: false, label: 'Date created', enterpriseOnly: false },
  { id: 'updated_ts', disablePadding: false, label: 'Last updated', enterpriseOnly: false },
  { id: 'roles', disablePadding: false, label: 'Role', enterpriseOnly: true },
  { id: 'actions', disablePadding: false, label: 'Manage', enterpriseOnly: false }
];

const UserList = ({ editUser, isEnterprise, roles, users }) => (
  <Table>
    <TableHead>
      <TableRow>
        {columnData.reduce((accu, column) => {
          if (column.enterpriseOnly && !isEnterprise) {
            return accu;
          }
          accu.push(
            <TableCell key={column.id} padding={column.disablePadding ? 'none' : 'normal'}>
              {column.label}
            </TableCell>
          );
          return accu;
        }, [])}
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user, index) => (
        <TableRow className="clickable" key={user.id || index} hover onClick={() => editUser(user)}>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <Time value={user.created_ts} />
          </TableCell>
          <TableCell>
            <RelativeTime updateTime={user.updated_ts} />
          </TableCell>
          {isEnterprise && <TableCell>{(user.roles || []).map(roleId => roles[roleId]?.name).join(', ')}</TableCell>}
          <TableCell>
            <div className="bold flexbox center-aligned link-color margin-right-small uppercased" style={{ whiteSpace: 'nowrap' }}>
              view details <ArrowRightAltIcon />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default UserList;
