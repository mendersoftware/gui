import React, { useEffect, useState } from 'react';

import { Button, Collapse, Divider, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

export const DeviceDataCollapse = ({ children, className = '', disableBottomBorder, header, isAddOn, isOpen, onClick, shouldUnmount = true, title }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(Boolean(isOpen));
  }, [isOpen]);

  const onCollapseClick = () => {
    if (!onClick) {
      return;
    }
    onClick(!open);
    setOpen(!open);
  };

  return (
    <div className={`margin-bottom ${className}`}>
      <div className={`${onClick ? 'clickable' : ''} flexbox space-between`} onClick={onCollapseClick} style={{ alignItems: 'flex-start' }}>
        {typeof title === 'string' ? <h4 className="margin-bottom-small">{title}</h4> : title}
        <div className="flexbox centered">
          {isAddOn && (
            <Button variant="contained" disabled style={{ marginRight: theme.spacing(2), fontWeight: 900, fontSize: 'smaller' }}>
              Add-on
            </Button>
          )}
          {onClick ? (
            <IconButton size="large">{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
          ) : (
            <div style={{ height: theme.spacing(6), width: theme.spacing(6) }} />
          )}
        </div>
      </div>
      <div>{header}</div>
      <Collapse className={open ? 'fadeIn' : 'fadeOut'} in={open} timeout="auto" unmountOnExit={shouldUnmount}>
        {children}
      </Collapse>
      {!disableBottomBorder && <Divider style={{ marginTop: theme.spacing(3) }} />}
    </div>
  );
};

export default DeviceDataCollapse;
