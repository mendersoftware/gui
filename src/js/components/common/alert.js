import React from 'react';

const Alert = ({ children, className, severity, style }) => (
  <div className={`${className || ''} alert ${severity ? `alert-${severity}` : ''}`} style={style}>
    {children}
  </div>
);

export default Alert;
