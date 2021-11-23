import React from 'react';

import { mdiGithub, mdiGoogle, mdiMicrosoft } from '@mdi/js';

import MaterialDesignIcon from '../common/materialdesignicon';

export const OAuth2Providers = [
  {
    id: 'github',
    name: 'Github',
    icon: <MaterialDesignIcon path={mdiGithub} />
  },
  {
    id: 'google',
    name: 'Google',
    icon: <MaterialDesignIcon path={mdiGoogle} />
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: <MaterialDesignIcon path={mdiMicrosoft} />
  }
];
