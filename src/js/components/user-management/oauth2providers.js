import React from 'react';

import { SvgIcon } from '@material-ui/core';
import { mdiGithub, mdiGoogle, mdiMicrosoft } from '@mdi/js';

export const OAuth2Providers = [
  {
    id: 'github',
    name: 'Github',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={mdiGithub} />
      </SvgIcon>
    )
  },
  {
    id: 'google',
    name: 'Google',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={mdiGoogle} />
      </SvgIcon>
    )
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={mdiMicrosoft} />
      </SvgIcon>
    )
  }
];
