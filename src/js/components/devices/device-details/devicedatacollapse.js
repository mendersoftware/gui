import React from 'react';

import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  addOnPill: { marginRight: theme.spacing(2), fontWeight: 900, fontSize: 'smaller' }
}));

export const DeviceDataCollapse = ({ children, className = '', header, isAddOn = false, title }) => {
  const { classes } = useStyles();

  return (
    <div className={`margin-bottom ${className}`}>
      <div className="flexbox space-between" style={{ alignItems: 'flex-start' }}>
        {typeof title === 'string' ? <h4 className="margin-bottom-small">{title}</h4> : title}
        <div className="flexbox centered">
          {isAddOn && (
            <Button className={classes.addOnPill} variant="contained" disabled>
              Add-on
            </Button>
          )}
        </div>
      </div>
      <div>{header}</div>
      {children}
    </div>
  );
};

export default DeviceDataCollapse;
