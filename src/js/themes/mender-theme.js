'use strict';

import { grey100, lightBlack, white } from '@material-ui/core/colors';

const colors = {
  linkgreen: '#347A87',
  mendergreen: '#015969', //
  grey: '#c7c7c7', //grey
  mendermaroon: '#5d0f43', //
  accent2Color: grey100,
  alertpurple: '#7D3F69', //
  textColor: 'rgba(0, 0, 0, 0.8)',
  alternateTextColor: white,
  canvasColor: white,
  borderColor: '#e0e0e0',
  expansionBackground: '#f5f5f5',
  disabledColor: lightBlack,
  errorStyleColor: '#ab1000'
};
export default {
  overrides: {
    MuiSnackbarContent: {
      action: {
        color: '#9E6F8E'
      }
    },
    MuiButton: {
      root: {
        borderRadius: 2
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
    }
  },
  palette: {
    primary: {
      main: colors.mendergreen
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
  }
};
