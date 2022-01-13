import { unstable_createMuiStrictModeTheme as createTheme } from '@material-ui/core';

import { palette, typography, overrides } from './common';

export const dark = () => {
  const customTheme = {
    palette: {
      mode: 'dark',
      ...palette,
      background: {
        default: '#222'
      }
    },
    typography,
    overrides: {
      ...overrides,
      MuiCssBaseline: {
        '@global': {
          body: {
            ...overrides.MuiCssBaseline['@global'].body,
            /**
             * Come Material v5 `enableColorScheme` on CssBaseLine to use theme.palette.background.default via theme.palette.mode
             */
            background: '#222'
          }
        }
      }
    }
  }

  //Note this fills in the standard MUI theme with the custom options and includes anything left unchanged with the MUI defaults
  return createTheme(customTheme);
};
