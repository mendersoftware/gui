import React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  flump: {
    borderBottom: `1px solid ${theme.palette.grey[50]}`,
    span: {
      background: theme.palette.background.default
    }
  },
  groupBorder: {
    background: theme.palette.grey[50]
  },
  groupHeading: {
    background: theme.palette.background.default
  }
}));

const LinedHeader = ({ className = '', heading, innerStyle = {}, innerRef, style = {} }) => {
  const { classes } = useStyles();
  return (
    <h4 className={`dashboard-header ${classes.flump} ${className}`} ref={innerRef} style={style}>
      <span style={innerStyle}>{heading}</span>
    </h4>
  );
};

export const LinedGroupHeader = ({ heading }) => {
  const { classes } = useStyles();
  return (
    <>
      <span className={classes.groupHeading}>{heading}</span>
      <div className={classes.groupBorder}></div>
    </>
  );
};

export default LinedHeader;
