import { accordionClasses } from '@mui/material/Accordion';
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

export const light = {
  palette: variantPalette,
  typography,
  components: {
    ...overrides,
    MuiAccordion: {
      styleOverrides: {
        root: {
          ...overrides.MuiAccordion.styleOverrides.root,
          [`&.${accordionClasses.expanded}`]: {
            ...overrides.MuiAccordion.styleOverrides.root[`&.${accordionClasses.expanded}`],
            backgroundColor: variantPalette.grey[400]
          }
        }
      }
    }
  }
};
