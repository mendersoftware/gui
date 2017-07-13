'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMixins;
function createMixins(breakpoints, spacing) {
  return {
    gutters: function gutters(styles) {
      styles.paddingLeft = spacing.unit * 2;
      styles.paddingRight = spacing.unit * 2;
      styles[breakpoints.up('sm')] = {
        paddingLeft: spacing.unit * 3,
        paddingRight: spacing.unit * 3
      };
      return styles;
    }
  };
}