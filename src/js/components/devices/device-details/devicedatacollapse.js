import React, { useEffect, useState } from 'react';

import { Collapse, Divider, IconButton } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

import theme from '../../../themes/mender-theme';

const paddingLeft = theme.spacing(4);

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
    <div className={`margin-top-small margin-bottom ${className}`}>
      <div className="clickable flexbox space-between" onClick={onCollapseClick} style={{ alignItems: 'flex-start' }}>
        {typeof title === 'string' ? <h4 className="margin-bottom-small">{title}</h4> : title}
        <IconButton>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
      </div>
      <div style={{ paddingLeft }}>{header}</div>
      <Collapse in={open} timeout="auto" unmountOnExit style={{ paddingLeft }}>
        {children}
      </Collapse>
      {!disableBottomBorder && <Divider style={{ marginTop: theme.spacing(2) }} />}
    </div>
  );
};

export default DeviceDataCollapse;
