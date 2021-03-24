import React, { Fragment } from 'react';

const defaultStyles = {
  regular: {
    maxWidth: 280,
    rowGap: 15
  },
  compact: {
    maxWidth: 280,
    gridTemplateColumns: 'max-content 1fr'
  }
};

export const TwoColumnData = ({ className = '', compact = false, config, style }) => {
  let applicableStyle = compact ? defaultStyles.compact : defaultStyles.regular;
  applicableStyle = { ...applicableStyle, ...style };
  return (
    <div className={`${className} text-muted two-columns`} style={applicableStyle}>
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
};

export const ConfigurationObject = ({ config, ...props }) => {
  const content = Object.entries(config).reduce((accu, [key, value]) => {
    accu[key] = `${value}`;
    return accu;
  }, {});
  return <TwoColumnData {...props} config={content} />;
};

export default ConfigurationObject;
