import React from 'react';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  default: { color: theme.palette.text.disabled, margin: '15px 0' }
}));

export const InfoText = ({ children, className = '', variant = '', ...props }) => {
  const { classes } = useStyles();
  const Component = variant === 'dense' ? 'span' : 'p';
  return (
    <Component className={`${classes.default} ${className}`} {...props}>
      {children}
    </Component>
  );
};
export default InfoText;
