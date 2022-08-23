import React, { Fragment, useState } from 'react';

import copy from 'copy-to-clipboard';

// material ui
import { Tooltip } from '@mui/material';
import { FileCopyOutlined as CopyToClipboardIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  root: {
    ['.key > b']: {
      backgroundColor: theme.palette.grey[400],
      color: theme.palette.getContrastText(theme.palette.grey[400])
    }
  }
}));

const ValueColumn = ({ value, setSnackbar }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const onClick = () => {
    if (setSnackbar) {
      let copyable = value;
      if (React.isValidElement(value)) {
        copyable = value.props.value;
      }
      copy(copyable);
      setSnackbar('Value copied to clipboard');
    }
  };
  return (
    <div
      className={`flexbox ${setSnackbar ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {value}
      {setSnackbar && (
        <Tooltip title={'Copy to clipboard'} placement="top" open={tooltipVisible}>
          <CopyToClipboardIcon color="primary" className={`margin-left-small ${tooltipVisible ? 'fadeIn' : 'fadeOut'}`} fontSize="small"></CopyToClipboardIcon>
        </Tooltip>
      )}
    </div>
  );
};

const KeyColumn = ({ value, chipLikeKey }) => (
  <div className={`align-right ${chipLikeKey ? 'key' : ''} muted`}>
    <b>{value}</b>
  </div>
);

export const TwoColumns = ({
  className = '',
  children,
  chipLikeKey = true,
  compact,
  items = {},
  KeyComponent = KeyColumn,
  KeyProps = {},
  setSnackbar,
  style = {},
  ValueComponent = ValueColumn,
  ValueProps = {}
}) => {
  const { classes } = useStyles();
  return (
    <div className={`break-all two-columns ${classes.root} ${compact ? 'compact' : ''} ${className}`} style={style}>
      {children
        ? children
        : Object.entries(items).map(([key, value]) => (
            <Fragment key={key}>
              <KeyComponent chipLikeKey={chipLikeKey} value={key} {...KeyProps} />
              <ValueComponent setSnackbar={setSnackbar} value={value} {...ValueProps} />
            </Fragment>
          ))}
    </div>
  );
};

export const TwoColumnData = ({ className = '', config, ...props }) => <TwoColumns className={`column-data ${className}`} items={config} {...props} />;

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
