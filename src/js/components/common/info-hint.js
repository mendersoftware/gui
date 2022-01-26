import React from 'react';

import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

const iconStyle = { verticalAlign: 'middle', margin: '0 6px 4px 0' };

export const InfoHint = ({ className = '', content, style = {} }) => (
  <p className={`info icon ${className}`} style={style}>
    <InfoOutlinedIcon fontSize="small" style={iconStyle} />
    {content}
  </p>
);

export default InfoHint;
