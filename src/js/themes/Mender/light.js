import { unstable_createMuiStrictModeTheme as createTheme } from '@material-ui/core';

import { palette, typography, overrides } from './common';

export const light = () => {
  const customTheme = {
    palette: {
      mode: 'light',
      ...palette,
      background: {
        default: '#fff'
      }
    },
    typography,
    overrides
  };

  //Note this fills in the standard MUI theme with the custom options and includes anything left unchanged with the MUI defaults
  return createTheme(customTheme);
};
