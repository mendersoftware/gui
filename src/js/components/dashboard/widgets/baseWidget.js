import React from 'react';
import Paper from '@material-ui/core/Paper';

export const styles = {
  rowStyle: {
    display: 'flex',
    flexDirection: 'row'
  },
  columnStyle: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightAlign: {
    alignItems: 'flex-end'
  },
  leftAlign: {
    alignItems: 'flex-start'
  },
  contentStyle: {
    height: '100%',
    width: '100%'
  }
};

export const BaseWidget = ({ className = '', footer, header, innerRef, isActive, main, onClick, showHelptips }) => {
  const content = (
    <div style={{ ...styles.contentStyle, ...styles.columnStyle }} ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
      {showHelptips ? main.prepend : null}
      {header ? (
        <div style={Object.assign({ borderBottomStyle: 'solid' }, styles.rowStyle)} className="widgetHeader">
          {header}
        </div>
      ) : null}
      <div style={Object.assign({}, styles.columnStyle, styles.rightAlign)} className="widgetMainContent align-right">
        <div className="header">{main.header}</div>
        <div className="counter">{main.counter}</div>
      </div>
      <span className="link">{main.targetLabel}</span>
      {footer ? (
        <div className="widgetFooter" style={Object.assign({ borderTopStyle: 'solid' }, styles.rowStyle)}>
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
    <div className={`notActive widget ${className}`} onClick={onClick}>
      {content}
    </div>
  );
};

export default BaseWidget;
