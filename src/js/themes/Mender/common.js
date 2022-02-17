import { listItemClasses } from '@mui/material/ListItem';
import { formLabelClasses } from '@mui/material/FormLabel';
import { accordionClasses } from '@mui/material/Accordion';
import { accordionSummaryClasses } from '@mui/material/AccordionSummary';

const secondaryText = 'rgba(0, 0, 0, 0.54)';

/**
 * @param qualitative if set is an ordered set of distinct colors availabe for programatic use.
 * @example Chart dataset colors
 */
export const palette = {
  primary: {
    main: '#337a87'
  },
  secondary: {
    main: '#5d0f43'
  },
  error: {
    light: 'rgba(93, 15, 67, 0.075)',
    main: '#ab1000',
    dark: '#770b00' // hardcode same as darken to match less variables
  },
  success: {
    main: '#009e73'
  },
  text: {
    /**
     * color matched from variables.less @text of #404041 but by opacity, same as main
     */
    primary: 'rgba(10, 10, 11, 0.78)',
    secondary: secondaryText,
    hint: secondaryText
  },
  brand: {
    mender: '#015969'
  }
};

const generatedColors = {
  a: palette.primary.main,
  b: '#a31773',
  c: '#00859e',
  d: '#14cfda',
  e: '#9bfff0',
  f: '#d5d5d5'
};
const qualitative = {};
for (const [grp, col] of Object.entries(generatedColors)) {
  qualitative[grp] = {
    main: col
  };
}
palette['qualitative'] = qualitative;

export const chartColorPalette = Object.values(generatedColors);

/**
 * Favor using materials' `theme.palette` instead due to themed support.
 */
export const colors = {
  /**
   * @deprecated #347A87 was close enough to use theme {@link palette.primary.main}
   */
  linkgreen: palette.primary.main,
  /**
   * @deprecated use theme {@link palette.brand.mender}
   */
  mendergreen: palette.brand.mender,
  grey: '#c7c7c7',
  /**
   * @deprecated use theme {@link palette.secondary.main}
   */
  mendermaroon: palette.secondary.main,
  accent2Color: '#f5f5f5',
  alertpurple: '#7D3F69',
  /**
   * @deprecated use theme {@link palette.text.primary}
   */
  textColor: palette.text.primary,
  /**
   * was rgba(0, 0, 0, 0.3) inconsistent with mutedText from variables.less .54
   * @deprecated use theme {@link palette.text.hint}
   */
  mutedText: palette.text.hint,
  /**
   * @deprecated Is not in use see {@link palette.text.secondary}
   */
  tooltipText: '#DECFD9',
  alternateTextColor: 'white',
  canvasColor: 'white',
  /**
   * @deprecated use theme.palette.grey[500]
   */
  borderColor: '#e0e0e0',
  /**
   * @deprecated use theme.palette.grey[400]
   */
  expansionBackground: '#f7f7f7',
  /**
   * @deprecated use theme.palette.text.secondary
   */
  disabledColor: secondaryText,
  /**
   * @deprecated use theme {@link palette.error.main}
   */
  errorStyleColor: palette.error.main,
  /**
   * @deprecated use theme {@link palette.sucess.main}
   */
  successStyleColor: '#009e73',
  red: '#8f0d0d',
  green: '#009e73'
};

const round = value => Math.round(value * 1e4) / 1e4;
const htmlFontSize = 16;
const fontSize = 13;
const coef = fontSize / 14;
const pxToRem = size => `${round((size / htmlFontSize) * coef)}rem`;

export const typography = {
  fontFamily: 'Lato, sans-serif',
  fontSize, // will be transformed to rem automatically by mui
  body1: {
    lineHeight: 1.5
  },
  pxToRem
};

const componentProps = {
  MuiFormControl: {
    defaultProps: {
      variant: 'standard'
    }
  },
  MuiTextField: {
    defaultProps: {
      variant: 'standard'
    }
  },
  MuiSelect: {
    defaultProps: {
      autoWidth: true,
      variant: 'standard'
    }
  }
};

export const overrides = {
  ...componentProps,
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: palette.text.primary
      }
    }
  },
  MuiSnackbarContent: {
    styleOverrides: {
      action: {
        color: '#9E6F8E'
      }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none'
      }
    }
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        border: 'none',
        boxShadow: 'none',
        '&:before': {
          display: 'none'
        },
        padding: 0,
        [`&.${accordionClasses.expanded}`]: {
          backgroundColor: colors.expansionBackground,
          margin: 'auto'
        }
      }
    }
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        marginBottom: 0,
        height: 48,
        [`&.${accordionSummaryClasses.expanded}`]: {
          height: 48,
          minHeight: 48
        }
      },
      content: {
        alignItems: 'center',
        [`&.${accordionSummaryClasses.expanded}`]: {
          margin: 0
        },
        '& > :last-child': {
          paddingRight: 12
        }
      }
    }
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        flexDirection: 'column'
      }
    }
  },
  MuiInput: {
    styleOverrides: {
      underline: {
        '&:before': {
          borderBottom: '1px solid rgb(224, 224, 224)'
        },
        '&:hover:not($disabled):before': {
          borderBottom: `2px solid ${colors.linkgreen} !important`
        },
        '&:after': {
          borderBottom: `2px solid ${colors.linkgreen}`
        }
      }
    }
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        color: palette.text.hint,
        [`&.${formLabelClasses.focused}`]: {
          color: colors.linkgreen
        }
      }
    }
  },
  MuiFormControl: {
    ...componentProps.MuiFormControl,
    styleOverrides: {
      root: {
        marginTop: '18px',
        minWidth: '240px'
      }
    }
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        marginTop: '18px'
      }
    }
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: palette.text.hint,
        fontSize: '1.2rem'
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 2,
        fontSize: 14,
        fontWeight: 'bold',
        '&:hover': {
          colors: palette.primary.main
        }
      },
      text: {
        padding: '10px 15px'
      }
    }
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        iconButton: {
          marginRight: '8px'
        }
      }
    }
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        paddingTop: 11,
        paddingBottom: 11,
        [`&.${listItemClasses.disabled}`]: {
          opacity: 1
        }
      }
    }
  },
  MuiListItemText: {
    styleOverrides: {
      root: {
        marginTop: 0,
        marginBottom: 0
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '0px 24px 0px 24px',
        height: '48px'
      },
      head: {
        height: '56px',
        lineHeight: '1.15rem'
      },
      paddingCheckbox: {
        padding: '0 0 0 6px',
        width: '54px'
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        minWidth: '40vw',
        maxWidth: '80vw',
        padding: '30px 75px 5%'
      }
    }
  }
};
