import React, { Fragment } from 'react';

export const TwoColumnData = ({ className = '', compact = false, config, style }) => (
  <div className={`break-all text-muted two-columns column-data ${compact ? 'compact' : ''} ${className}`} style={style}>
    {Object.entries(config).map(([key, value]) => (
      <Fragment key={key}>
        <div className="align-right">
          <b>{key}</b>
        </div>
        <div>{value}</div>
      </Fragment>
    ))}
  </div>
);

export const TwoColumnDataMultiple = ({ className = '', config, style }) => (
  <div className={`two-columns-multiple ${className}`} style={{ ...style }}>
    {Object.entries(config).map(([key, value]) => (
      <TwoColumnData className="multiple" config={{ [key]: value }} key={key} compact />
    ))}
  </div>
);

export const ConfigurationObject = ({ config, ...props }) => {
  const content = Object.entries(config).reduce((accu, [key, value]) => {
    accu[key] = `${value}`;
    return accu;
  }, {});
  return <TwoColumnData {...props} config={content} />;
};

export default ConfigurationObject;
