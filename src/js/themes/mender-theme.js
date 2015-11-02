'use strict';

var Colors = require('material-ui/lib/styles/colors');
var ColorManipulator = require('material-ui/lib/utils/color-manipulator');
var Spacing = require('material-ui/lib/styles/spacing');
/*
module.exports = {
  spacing: Spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: "#347A87",
    primary2Color: "#015969",
    primary3Color: "#8c8c8d",
    accent1Color: "#7D3F69",
    accent2Color: Colors.grey100,
    accent3Color: "#99BDC3",
    textColor: "#404041",
    alternateTextColor: "#E1E1E1",
    canvasColor: Colors.white,
    borderColor: "#EEEEEE",
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3)
  }
}; */

module.exports = {
  spacing: Spacing,
  fontFamily: 'Lato, sans-serif',
  palette: {
    primary1Color: "#679BA5",
    primary2Color: "#015969",
    primary3Color: "#8c8c8d",
    accent1Color: "#5D0F43",
    accent2Color: Colors.grey100,
    accent3Color: "#99BDC3",
    textColor: "#404041",
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: "#e0e0e0",
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3)
  }
};