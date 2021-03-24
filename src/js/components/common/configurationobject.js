import React, { Fragment } from 'react';

const style = {
  regular: {
    maxWidth: 280,
    rowGap: 15
  },
  compact: {
    maxWidth: 280,
    gridTemplateColumns: 'max-content 1fr'
  }
};

export const ConfigurationObject = ({ className = '', compact = false, config }) => (
  <div className={`${className} text-muted two-columns`} style={compact ? style.compact : style.regular}>
    {Object.entries(config).map(([key, value]) => (
      <Fragment key={key}>
        <div className="align-right">
          <b>{key}</b>
        </div>
        <div>{`${value}`}</div>
      </Fragment>
    ))}
  </div>
);

export default ConfigurationObject;
