import React from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
  rowStyle: {
    display: 'flex',
    flexDirection: 'row'
  },
  rightAlign: {
    alignItems: 'flex-end'
  },
  leftAlign: {
    alignItems: 'flex-start'
  },
  contentWrapper: {
    height: '100%',
    width: '100%'
  },
  notActive: {
    background: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[400]
  }
}));

export const BaseWidget = ({ className = '', footer, header, innerRef, isActive, main, onClick, showHelptips }) => {
  const { classes } = useStyles();
  const content = (
    <div className={`flexbox column ${classes.contentWrapper}`} ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
      {showHelptips ? main.prepend : null}
      {header ? (
        <div className="flexbox widgetHeader" style={{ borderBottomStyle: 'solid' }}>
          {header}
        </div>
      ) : null}
      <div className={`flexbox column widgetMainContent align-right ${classes.rightAlign}`}>
        <div className="header">{main.header}</div>
        <div className="counter">{main.counter}</div>
      </div>
      <span className="link">{main.targetLabel}</span>
      {footer ? (
        <div className="flexbox widgetFooter" style={{ borderTopStyle: 'solid' }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
  if (isActive) {
    return (
      <Paper className={`widget ${className}`} onClick={onClick} elevation={2}>
        {content}
      </Paper>
    );
  }
  return (
    <div className={`widget ${classes.notActive} ${className}`} onClick={onClick}>
      {content}
    </div>
  );
};

export default BaseWidget;
