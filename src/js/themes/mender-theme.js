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
  disabledColor: lightBlack,
  errorStyleColor: '#ab1000'
};
export default {
  overrides: {
    MuiSnackbarContent: {
      action: {
        color: '#9E6F8E'
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
