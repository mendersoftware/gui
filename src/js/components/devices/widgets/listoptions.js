import React, { useState } from 'react';

// material ui
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropUp as ArrowDropUpIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

const baseOptions = {
  customize: { title: 'Customize' }
  // csvExport: { title: 'Export as CSV' }
};

const ListOptions = ({ handlers }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const options = Object.entries(handlers).reduce((accu, [key, onClick]) => {
    if (baseOptions[key]) {
      accu.push({ ...baseOptions[key], key, onClick });
    }
    return accu;
  }, []);

  return (
    <>
      <Button style={{ textTransform: 'none' }} onClick={e => setAnchorEl(e.currentTarget)} endIcon={anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}>
        Table options
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
