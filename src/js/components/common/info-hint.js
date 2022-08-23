import React from 'react';

import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import InfoText from './infotext';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  default: { gap: theme.spacing() }
}));

export const InfoHint = ({ className = '', content, ...props }) => {
  const { classes } = useStyles();
  return (
    <InfoText className={`icon flexbox center-aligned ${classes.default} ${className}`} {...props}>
      <InfoOutlinedIcon fontSize="small" />
      {content}
    </InfoText>
  );
};

export default InfoHint;
