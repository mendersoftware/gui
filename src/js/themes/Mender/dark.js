import { accordionClasses } from '@mui/material/Accordion';
import { buttonClasses } from '@mui/material/Button';

import { palette as commonPalette, typography, overrides } from './common';

const grey = {
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
  '50': '#1d1f20'
};
const paper = '#343434';

const palette = {
  ...commonPalette,
  mode: 'dark',
  grey,
  background: {
    light: '#1d1f20',
    lightgrey: paper,
    default: '#222',
    paper
  },
  text: {
    primary: 'hsl(240deg 5% 93% / 78%)'
  }
};

export const dark = {
  palette,
  typography,
  components: {
    ...overrides,
    MuiAccordion: {
      ...overrides.MuiAccordion,
      styleOverrides: {
        root: {
          ...overrides.MuiAccordion.styleOverrides.root,
          [`&.${accordionClasses.expanded}`]: {
            ...overrides.MuiAccordion.styleOverrides.root[`&.${accordionClasses.expanded}`],
            backgroundColor: palette.grey['A400']
          }
        }
      }
    },
    MuiButton: {
      ...overrides.MuiButton,
      styleOverrides: {
        ...overrides.MuiButton.styleOverrides,
        root: {
          ...overrides.MuiButton.styleOverrides.root,
          [`&.${buttonClasses.text}`]: {
            ...overrides.MuiButton.styleOverrides.root[`&.${buttonClasses.text}`],
            color: palette.text.primary
          }
        }
      }
    },
    MuiIconButton: {
      ...overrides.MuiIconButton,
      styleOverrides: {
        ...overrides.MuiIconButton.styleOverrides,
        root: {
          ...overrides.MuiIconButton.styleOverrides.root,
          color: palette.text.primary
        }
      }
    },
    MuiListItem: {
      ...overrides.MuiListItem,
      styleOverrides: {
        ...overrides.MuiListItem.styleOverrides,
        root: {
          ...overrides.MuiListItem.styleOverrides.root,
          [`&.active`]: {
            backgroundColor: palette.background.default
          },
          [`&.leftNav.active`]: {
            borderTop: `1px solid ${palette.grey[50]}`,
            borderBottom: `1px solid ${palette.grey[50]}`
          }
        }
      }
    },
    MuiListItemText: {
      ...overrides.MuiListItemText,
      styleOverrides: {
        ...overrides.MuiListItemText.styleOverrides,
        root: {
          ...overrides.MuiListItemText.styleOverrides.root,
          color: palette.text.primary
        }
      }
    }
  }
};
