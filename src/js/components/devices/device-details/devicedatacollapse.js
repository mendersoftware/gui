import React, { useEffect, useState } from 'react';

import { Collapse, Divider, IconButton } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

import theme from '../../../themes/mender-theme';

export const DeviceDataCollapse = ({ children, className = '', disableBottomBorder, header, isOpen, onClick, title }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(Boolean(isOpen));
  }, [isOpen]);

  const onCollapseClick = () => {
    onClick(!open);
    setOpen(!open);
  };

  return (
    <div className={`margin-bottom ${className}`}>
      <div className="clickable flexbox space-between" onClick={onCollapseClick} style={{ alignItems: 'flex-start' }}>
        {typeof title === 'string' ? <h4 className="margin-bottom-small">{title}</h4> : title}
        <IconButton>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
      </div>
      <div>{header}</div>
      <Collapse className={open ? 'fadeIn' : 'fadeOut'} in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
      {!disableBottomBorder && <Divider style={{ marginTop: theme.spacing(3) }} />}
    </div>
  );
};

export default DeviceDataCollapse;
