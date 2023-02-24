import React from 'react';

// material ui
import { Sort as SortIcon } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { SORTING_OPTIONS } from '../../constants/appConstants';

const useStyles = makeStyles()(() => ({
  header: {
    '.columnHeader': {
      display: 'table-cell'
    },
    '.nonSortable': { cursor: 'initial' }
  }
}));

export const DetailsTable = ({ className = '', columns, items, onChangeSorting, onItemClick, sort = {}, style = {} }) => {
  const { classes } = useStyles();
  return (
    <Table className={`margin-bottom ${className}`} style={style}>
      <TableHead className={classes.header}>
        <TableRow>
          {columns.map(({ extras, key, renderTitle, sortable, title }) => (
            <TableCell key={key} className={`columnHeader ${sortable ? '' : 'nonSortable'}`} onClick={() => (sortable ? onChangeSorting(key) : null)}>
              {renderTitle ? renderTitle(extras) : title}
              {sortable && <SortIcon className={`sortIcon selected ${(sort.direction === SORTING_OPTIONS.desc).toString()}`} />}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow className={onItemClick ? 'clickable' : ''} hover key={item.id || index} onClick={() => (onItemClick ? onItemClick(item) : null)}>
            {columns.map(column => (
              <TableCell className="relative" key={column.key}>
                {column.render(item, column.extras)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DetailsTable;
