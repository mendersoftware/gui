import React from 'react';

export const BaseWidget = ({ className = '', header, innerRef, main, onClick }) => (
  <div className={`widget ${className}`} onClick={onClick} ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
    {!!header && <div className="flexbox widgetHeader">{header}</div>}
    {React.isValidElement(main) ? (
      <div className="widgetMainContent">{main}</div>
    ) : (
      <div className="flexbox column widgetMainContent">
        <div className="counter">{main.counter}</div>
        {main.targetLabel && <span className="link">{main.targetLabel}</span>}
      </div>
    )}
  </div>
);

export default BaseWidget;
