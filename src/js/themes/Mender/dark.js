import { unstable_createMuiStrictModeTheme as createTheme, adaptV4Theme } from '@mui/material';

import { palette, typography, overrides } from './common';

const variantPalette = {
  ...palette,
  mode: 'dark',
  grey: {
    'A400': '#5c5c5c',
    '900': '#2a2828',
    '800': '#484747',
    '700': '#696868',
    '600': '#8c8c8c',
    '500': '#b1b1b1',
    '400': '#d7d7d7',
    '300': '#a0c7c4',
    '200': '#89c6c1',
    '100': '#4dc3bc',
    '50': '#00c1b9'
  },
  background: {
    default: '#222',
    paper: '#343434'
  },
  text: {
    primary: 'hsl(240deg 5% 93% / 78%)',
    hint: 'rgba(0, 0, 0, 0.54)'
  }
};

export const dark = () => {
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
          '$expanded': {
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
