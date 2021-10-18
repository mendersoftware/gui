import React from 'react';

import { SvgIcon } from '@material-ui/core';
import { mdiGithub, mdiGoogle } from '@mdi/js';

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
  }
];
