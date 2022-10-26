import React from 'react';

export const BaseWidget = ({ className = '', footer, header, innerRef, main, onClick }) => {
  return (
    <div className={`widget flexbox column ${className}`} onClick={onClick} ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
      {!!header && <div className="flexbox widgetHeader">{header}</div>}
      <div className="flexbox column widgetMainContent">
        <div className="header">{main.header}</div>
        <div className="counter">{main.counter}</div>
      </div>
      <span className="link">{main.targetLabel}</span>
      {!!footer && <div className="flexbox widgetFooter">{footer}</div>}
    </div>
  );
};

export default BaseWidget;
