import React, { useState } from 'react';

// material ui
import { Checkbox, MenuItem, Select } from '@material-ui/core';

import theme from '../../../themes/mender-theme';
import { DEVICE_ISSUE_OPTIONS } from '../../../constants/deviceConstants';

export const EmptySelection = ({ allSelected, emptySelection, onToggleClick }) => (
  <MenuItem value="" style={{ fontSize: 13, paddingRight: theme.spacing(3) }}>
    <Checkbox
      checked={allSelected}
      indeterminate={!(allSelected || emptySelection)}
      style={{ marginLeft: theme.spacing(-1.5) }}
      size="small"
      onChange={onToggleClick}
    />
    Show only devices requiring attention
  </MenuItem>
);

const menuProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left'
  },
  getContentAnchorEl: null
};

const DeviceIssuesSelection = ({ onChange, onSelectAll, options, selection }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = e => {
    if (e && e.target.closest('input')?.hasOwnProperty('checked')) {
      return;
    }
    setOpen(true);
  };

  const onClearClick = () => onChange({ target: { value: [] } });

  const onToggleAllClick = ({ target: { checked } }) => onSelectAll(checked);

  return (
    <Select
      className="margin-left"
      disableUnderline
      displayEmpty
      MenuProps={menuProps}
      multiple
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      onChange={onChange}
      renderValue={selected => {
        const optionsCount = options.length;
        if (!selected.length || selected.length !== 1) {
          return <EmptySelection allSelected={selected.length === optionsCount} emptySelection={!selected.length} onToggleClick={onToggleAllClick} />;
        }
        return (
          <MenuItem value="" style={{ fontSize: 13, paddingRight: theme.spacing(3) }}>
            <Checkbox checked style={{ marginLeft: theme.spacing(-1.5) }} onChange={onClearClick} size="small" />
            {DEVICE_ISSUE_OPTIONS[selected[0]].title}
          </MenuItem>
        );
      }}
      value={selection}
      SelectDisplayProps={{ style: { padding: 0 } }}
      style={{ fontSize: 13, marginLeft: theme.spacing() }}
    >
      {options.map(({ count, key, title }) => (
        <MenuItem key={key} value={key}>
          <Checkbox checked={selection.includes(key)} style={{ marginLeft: theme.spacing(-1.5) }} />
          {title} ({count})
        </MenuItem>
      ))}
    </Select>
  );
};

export default DeviceIssuesSelection;
