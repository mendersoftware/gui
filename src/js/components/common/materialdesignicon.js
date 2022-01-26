import React from 'react';

import { SvgIcon } from '@mui/material';
import { mdiImageBrokenVariant } from '@mdi/js';

const MaterialDesignIcon = ({ path = mdiImageBrokenVariant, style = {} }) => (
  <SvgIcon fontSize="inherit" style={style}>
    <path d={path} />
  </SvgIcon>
);

export default MaterialDesignIcon;
