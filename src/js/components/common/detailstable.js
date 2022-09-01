import React from 'react';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export const DetailsTable = ({ columns, items, onItemClick }) => {
  return (
    <Table className="margin-bottom">
      <TableHead>
        <TableRow>
          {columns.map(({ key, title }) => (
            <TableCell key={key}>{title}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow className="clickable" hover key={item.id || index} onClick={() => onItemClick(item)}>
            {columns.map(column => (
              <TableCell key={column.key}>{column.render(item, column.extras)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DetailsTable;
