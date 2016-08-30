'use strict';

var Colors = require('material-ui/styles/colors');
import { fade } from 'material-ui/utils/colorManipulator';
var Spacing = require('material-ui/styles/spacing');

module.exports = {
  spacing: Spacing,
  fontFamily: 'Lato, sans-serif',
  palette: {
    primary1Color: "#347A87",
    primary2Color: "#015969",
    primary3Color: "#8c8c8d",
    accent1Color: "#5d0f43",
    accent2Color: Colors.grey100,
    accent3Color: "#7D3F69",
    textColor: "rgba(0,0,0,0.8)",
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: "#e0e0e0",
    disabledColor: fade(Colors.darkBlack, 0.3),
  },
  snackbar: {
    actionColor: "#9E6F8E"
  },
};