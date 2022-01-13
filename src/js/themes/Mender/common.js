// import { useTheme as useThemeMui } from '@material-ui/core/styles';
// const getContrastText = useThemeMui().palette.getContrastText;

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
    main: '#ab1000'
  },
  success: {
    main: '#009e73'
  },
  text: {
    /**
     * color matched from variables.less @text of #404041 but by opacity, same as main
     */
    primary: 'rgba(10, 10, 11, 0.78)',
    hint: 'rgba(0, 0, 0, 0.54)'
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
    main: col,
    // contrastText: getContrastText(col)
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
  disabledColor: 'rgba(0, 0, 0, 0.54)',
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

export const typography = {
  fontFamily: 'Lato, sans-serif'
};

export const overrides = {
  MuiCssBaseline: {
    '@global': {
      body: {
        fontSize: '0.8125rem' // 13px as from variables.less
      }
    }
  },
  MuiSnackbarContent: {
    action: {
      color: '#9E6F8E'
    }
  },
  MuiTab: {
    root: {
      textTransform: 'none'
    }
  },
  MuiAccordion: {
    root: {
      border: 'none',
      boxShadow: 'none',
      '&:before': {
        display: 'none'
      },
      padding: 0,
      '$expanded': {
        backgroundColor: colors.expansionBackground,
        margin: 'auto'
      }
    }
  },
  MuiAccordionSummary: {
    root: {
      marginBottom: 0,
      height: 48,
      '&$expanded': {
        height: 48,
        minHeight: 48
      }
    },
    content: {
      alignItems: 'center',
      '&$expanded': {
        margin: 0
      },
      '& > :last-child': {
        paddingRight: 12
      }
    }
  },
  MuiAccordionDetails: {
    root: {
      flexDirection: 'column'
    }
  },
  MuiInput: {
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
  },
  MuiFormLabel: {
    root: {
      color: palette.text.hint,
      '&$focused': {
        color: colors.linkgreen
      }
    }
  },
  MuiFormControl: {
    root: {
      marginTop: '18px',
      minWidth: '240px'
    }
  },
  MuiFormControlLabel: {
    root: {
      marginTop: '18px'
    }
  },
  MuiIconButton: {
    root: {
      color: palette.text.hint,
      fontSize: '1.2rem'
    }
  },
  MuiButton: {
    root: {
      borderRadius: 2,
      '&:hover': {
        colors: palette.primary.main
      }
    },
    text: {
      padding: '10px 15px'
    }
  },
  MuiSvgIcon: {
    root: {
      iconButton: {
        marginRight: '8px'
      }
    }
  },
  MuiListItem: {
    root: {
      '&$disabled': {
        opacity: 1
      },
      paddingTop: 11,
      paddingBottom: 11
    }
  },
  MuiListItemText: {
    root: {
      marginTop: 0,
      marginBottom: 0
    }
  },
  MuiTableCell: {
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
  },
  MuiDrawer: {
    paper: {
      minWidth: '40vw',
      maxWidth: '80vw',
      padding: '30px 75px 5%'
    }
  }
};
