import React from 'react';

import { SvgIcon } from '@mui/material';

import { mdiImageBrokenVariant } from '@mdi/js';

const MaterialDesignIcon = ({ className = '', path = mdiImageBrokenVariant, style = {} }) => (
  <SvgIcon className={className} fontSize="inherit" style={style}>
    <path d={path} />
  </SvgIcon>
);

export default MaterialDesignIcon;
