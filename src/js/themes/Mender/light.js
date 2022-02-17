import { accordionClasses } from '@mui/material/Accordion';
import { buttonClasses } from '@mui/material/Button';
import { listItemTextClasses } from '@mui/material/ListItemText';

import { palette, typography, overrides } from './common';

const variantPalette = {
  ...palette,
  mode: 'light',
  grey: {
    '900': '#969696',
    '800': '#a9a9a9',
    '700': '#bcbcbc',
    '600': '#cfcfcf',
    '500': '#e9e9e9',
    '400': '#f7f7f7',
    '300': '#e6f2f1',
    '200': '#ddedec',
    '100': '#d8ebe9',
    '50': '#d4e9e7'
  },
  background: {
    default: '#fff',
    dark: 'rgb(50, 50, 50)'
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
    },
    MuiButton: {
      styleOverrides: {
        ...overrides.MuiButton.styleOverrides,
        root: {
          ...overrides.MuiButton.styleOverrides.root,
          [`&.${buttonClasses.text}`]: {
            ...overrides.MuiButton.styleOverrides.root[`&.${buttonClasses.text}`],
            color: variantPalette.text.primary
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        ...overrides.MuiListItem.styleOverrides,
        root: {
          ...overrides.MuiListItem.styleOverrides.root,
          [`&.active`]: {
            backgroundColor: variantPalette.background.default
          },
          [`&.leftNav.active`]: {
            borderTop: `1px solid ${variantPalette.grey[50]}`,
            borderBottom: `1px solid ${variantPalette.grey[50]}`
          },
          [`&.navLink, &.navLink .${listItemTextClasses.root}`]: {
            color: variantPalette.grey[900]
          }
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        ...overrides.MuiListItemText.styleOverrides,
        root: {
          ...overrides.MuiListItemText.styleOverrides.root,
          color: variantPalette.text.primary
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: variantPalette.background.dark
        }
      }
    }
  }
};
