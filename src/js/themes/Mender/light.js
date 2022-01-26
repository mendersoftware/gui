import { unstable_createMuiStrictModeTheme as createTheme, adaptV4Theme } from '@mui/material';

import { palette, typography, overrides } from './common';

const variantPalette = {
  ...palette,
  mode: 'light',
  grey: {
    '900': '#969696',
    '800': '#a9a9a9',
    '700': '#bcbcbc',
    '600': '#cfcfcf',
    '500': '#e3e3e3',
    '400': '#f7f7f7',
    '300': '#e6f2f1',
    '200': '#ddedec',
    '100': '#d8ebe9',
    '50': '#d4e9e7'
  },
  background: {
    default: '#fff'
  }
};

export const light = () => {
  const customTheme = {
    palette: variantPalette,
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
            background: variantPalette.background.default
          }
        }
      },
      MuiAccordion: {
        root: {
          ...overrides.MuiAccordion.root,
          '&$expanded': {
            ...overrides.MuiAccordion.root['&$expanded'],
            backgroundColor: variantPalette.grey[400]
          }
        }
      }
    }
  };

  //Note this fills in the standard MUI theme with the custom options and includes anything left unchanged with the MUI defaults
  return createTheme(adaptV4Theme(customTheme));
};
