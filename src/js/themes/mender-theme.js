'use strict';

import { darkBlack, grey100, white } from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import Spacing from 'material-ui/styles/spacing';

export default {
  spacing: Spacing,
  fontFamily: 'Lato, sans-serif',
  palette: {
    primary1Color: '#347A87',
    primary2Color: '#015969',
    primary3Color: '#c7c7c7',
    accent1Color: '#5d0f43',
    accent2Color: grey100,
    accent3Color: '#7D3F69',
    textColor: 'rgba(0,0,0,0.8)',
    alternateTextColor: white,
    canvasColor: white,
    borderColor: '#e0e0e0',
    disabledColor: fade(darkBlack, 0.3)
  },
  snackbar: {
    actionColor: '#9E6F8E'
  }
};
