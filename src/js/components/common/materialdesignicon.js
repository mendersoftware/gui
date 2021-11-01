import React from 'react';

import { SvgIcon } from '@material-ui/core';
import { mdiImageBrokenVariant } from '@mdi/js';

const MaterialDesignIcon = ({ path = mdiImageBrokenVariant, style = {} }) => (
  <SvgIcon fontSize="inherit" style={style}>
    <path d={path} />
  </SvgIcon>
);

export default MaterialDesignIcon;
