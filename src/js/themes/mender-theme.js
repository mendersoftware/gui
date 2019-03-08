import { createMuiTheme } from '@material-ui/core/styles';
import { grey100, lightBlack, white } from '@material-ui/core/colors';

const colors = {
  linkgreen: '#347A87',
  mendergreen: '#337a87', //
  grey: '#c7c7c7', //grey
  mendermaroon: '#5d0f43', //
  accent2Color: grey100,
  alertpurple: '#7D3F69', //
  textColor: 'rgba(0, 0, 0, 0.8)',
  mutedText: 'rgba(0, 0, 0, 0.3)',
  alternateTextColor: white,
  canvasColor: white,
  borderColor: '#e0e0e0',
  expansionBackground: '#f5f5f5',
  disabledColor: lightBlack,
  errorStyleColor: '#ab1000'
};

export default createMuiTheme({ 
  palette: {
    primary: {
      main: colors.mendergreen,
    },
    secondary: {
      main: colors.mendermaroon
    },
    error: {
      main: colors.errorStyleColor
    },
    text: {
      main: colors.textColor
    }
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
    useNextVariants: true
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
    MuiExpansionPanel: {
      root: {
        border: 'none',
        borderTop: 'solid 1px',
        borderTopColor: colors.borderColor,
        boxShadow: 'none',
        '&:before': {
          display: 'none'
        },
        padding: 0
      },
      expanded: {
        backgroundColor: colors.expansionBackground,
        margin: 'auto'
      }
    },
    MuiExpansionPanelSummary: {
      root: {
        marginBottom: -1,
        height: 48,
        '&:hover': {
          backgroundColor: colors.expansionBackground
        },
        '&$expanded': {
          height: 48
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
    MuiExpansionPanelDetails: {
      root: {
        flexDirection: 'column'
      }
    },
    MuiInput: {
      underline: {
        '&:before': {
          borderBottom: '1px solid rgb(224, 224, 224)',
        },
        '&:hover:not($disabled):before': {
          borderBottom: '2px solid #347A87 !important',
        },
        '&:after': {
          borderBottom: '2px solid #347A87',
        },
      },
    },
    MuiFormLabel: {
      root: {
        color: colors.mutedText,
        '&$focused': {
          color: colors.linkgreen,
        },
      },
    },
    MuiFormControl: {
      root: {
        marginTop: '18px',
      },
    },
    MuiFormControlLabel: {
      root: {
        marginTop: '18px',
      },
    },
    MuiIconButton: {
      root: {
        color: colors.mutedText,
      }
    },
    MuiButton: {
      root: {
        color: colors.linkgreen,
        '&:hover': {
          colors: colors.mendergreen,
        }
      }
    },
    MuiListItemText: {
      root: {
        fontSize: '0.87rem',
      },
      '&$primary': {
        fontSize: '0.87rem',
      }
    },
  },
});
