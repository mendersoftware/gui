import { createMuiTheme } from '@material-ui/core/styles';

const palette = {
  primary: {
    main: '#337a87'
  },
  secondary: {
    main: '#5d0f43'
  },
  error: {
    main: '#ab1000'
  },
  text: {
    main: 'rgba(0, 0, 0, 0.8)'
  }
};

export const colors = {
  linkgreen: '#347A87',
  /**
   * @deprecated use theme.palette.primary.main
   */
  mendergreen: palette.primary.main,
  grey: '#c7c7c7',
  /**
   * @deprecated use theme.palette.secondary.main
   */
  mendermaroon: palette.secondary.main,
  accent2Color: '#f5f5f5',
  alertpurple: '#7D3F69',
  /**
   * @deprecated use theme.palette.text.main
   */
  textColor: palette.text.main,
  mutedText: 'rgba(0, 0, 0, 0.3)',
  tooltipText: '#DECFD9',
  alternateTextColor: 'white',
  canvasColor: 'white',
  borderColor: '#e0e0e0',
  expansionBackground: '#f7f7f7',
  disabledColor: 'rgba(0, 0, 0, 0.54)',
  /**
   * @deprecated use theme.palette.error.main
   */
  errorStyleColor: palette.error.main,
  successStyleColor: '#009e73', // TODO: Same as `green` should be theme.palette.success.main
  red: '#8f0d0d',
  green: '#009e73'
};

export const chartColorPalette = [palette.secondary.main, '#a31773', '#00859e', '#14cfda', '#9bfff0', '#d5d5d5'];

/**
 * Usage with `import { useTheme } from "@material-ui/core/styles"` within components
 */
export const createMenderTheme = () =>
  createMuiTheme({
    palette,
    typography: {
      fontFamily: 'Lato, sans-serif'
    },
    overrides: {
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
          '&$expanded': {
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
          color: colors.mutedText,
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
          color: colors.mutedText,
          fontSize: '1.2rem'
        }
      },
      MuiButton: {
        root: {
          borderRadius: 2,
          '&:hover': {
            colors: colors.mendergreen
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
          fontSize: '0.8rem',
          '&$primary': {
            fontSize: '0.8rem'
          },
          marginTop: 0,
          marginBottom: 0
        }
      },
      MuiTypography: {
        body1: {
          fontSize: '0.8rem'
        },
        subtitle1: {
          fontSize: '0.8rem'
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
    }
  });

export default createMenderTheme();
