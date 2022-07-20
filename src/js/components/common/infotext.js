import React from 'react';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  default: { margin: '15px 0', color: theme.palette.text.disabled }
}));

export const InfoText = ({ children, className = '', ...props }) => {
  const { classes } = useStyles();

  return (
    <p className={`${classes.default} ${className}`} {...props}>
      {children}
    </p>
  );
};
export default InfoText;
