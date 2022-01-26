import { accordionClasses } from '@mui/material/Accordion';
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

export const dark = {
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
            backgroundColor: variantPalette.grey['A400']
          }
        }
      }
    }
  }
};
