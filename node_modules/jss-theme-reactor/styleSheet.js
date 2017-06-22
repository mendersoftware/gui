'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createStyleSheet = createStyleSheet;
function createStyleSheet(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!options.insertionPoint) {
    options.insertionPoint = 'jss-theme-reactor';
  }

  var styleSheet = {
    name: name,
    options: options,
    createRules: createRules
  };

  function createRules() {
    var theme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var rules = typeof callback === 'function' ? callback(theme) : callback;

    if (!theme.overrides || !theme.overrides[name]) {
      return rules;
    }

    var overrides = theme.overrides[name];
    var rulesWithOverrides = _extends({}, rules);

    Object.keys(overrides).forEach(function (n) {
      rulesWithOverrides[n] = Object.assign(rulesWithOverrides[n] || {}, overrides[n]);
    });

    return rulesWithOverrides;
  }

  return styleSheet;
}