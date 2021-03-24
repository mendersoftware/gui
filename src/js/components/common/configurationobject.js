import React, { Fragment } from 'react';

import copy from 'copy-to-clipboard';

export const TwoColumnData = ({ className = '', compact = false, config, setSnackbar, style }) => {
  const onClick = ({ target: { textContent } }) => {
    if (setSnackbar) {
      copy(textContent);
      setSnackbar('Value copied to clipboard');
    }
  };

  return (
    <div className={`break-all text-muted two-columns column-data ${compact ? 'compact' : ''} ${className}`} style={style}>
      {Object.entries(config).map(([key, value]) => (
        <Fragment key={key}>
          <div className="align-right">
            <b>{key}</b>
          </div>
          <div onClick={onClick}>{value}</div>
        </Fragment>
      ))}
    </div>
  );
};

export const TwoColumnDataMultiple = ({ className = '', config, style, ...props }) => (
  <div className={`two-columns-multiple ${className}`} style={{ ...style }}>
    {Object.entries(config).map(([key, value]) => (
      <TwoColumnData className="multiple" config={{ [key]: value }} key={key} compact {...props} />
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
