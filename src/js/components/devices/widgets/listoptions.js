import React, { useState } from 'react';

import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@mui/icons-material';
// material ui
import { Button, Menu, MenuItem } from '@mui/material';

const ListOptions = ({ options, title = 'Table options' }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Button style={{ textTransform: 'none' }} onClick={e => setAnchorEl(e.currentTarget)} endIcon={anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}>
        {title}
      </Button>
      <Menu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={Boolean(anchorEl)}>
        {options.map(({ key, title, onClick }) => (
          <MenuItem key={key} onClick={onClick} value={key}>
            {title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ListOptions;
