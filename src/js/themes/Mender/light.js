import { accordionClasses } from '@mui/material/Accordion';
import { formLabelClasses } from '@mui/material/FormLabel';
import { buttonClasses } from '@mui/material/Button';
import { listItemTextClasses } from '@mui/material/ListItemText';

import { palette as commonPalette, typography, overrides } from './common';

const grey = {
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
};

const palette = {
  ...commonPalette,
  mode: 'light',
  grey,
  background: {
    light: '#fdfdfd',
    lightgrey: grey[400],
    default: '#fff',
    dark: 'rgb(50, 50, 50)'
  }
};

export const light = {
  palette,
  typography,
  components: {
    ...overrides,
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.text.primary
        }
      }
    },
    MuiAccordion: {
      ...overrides.MuiAccordion,
      styleOverrides: {
        root: {
          ...overrides.MuiAccordion.styleOverrides.root,
          [`&.${accordionClasses.expanded}`]: {
            ...overrides.MuiAccordion.styleOverrides.root[`&.${accordionClasses.expanded}`],
            backgroundColor: palette.grey[400]
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
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: palette.text.hint,
          [`&.${formLabelClasses.focused}`]: {
            color: palette.primary.main
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
          color: palette.text.hint
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
          },
          [`&.navLink, &.navLink .${listItemTextClasses.root}`]: {
            color: palette.grey[900]
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
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.background.dark
        }
      }
    }
  }
};
