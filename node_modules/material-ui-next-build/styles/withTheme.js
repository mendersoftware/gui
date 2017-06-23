'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = withTheme;

var _createEagerFactory = require('recompose/createEagerFactory');

var _createEagerFactory2 = _interopRequireDefault(_createEagerFactory);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _customPropTypes = require('../utils/customPropTypes');

var _customPropTypes2 = _interopRequireDefault(_customPropTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Provide the theme object as a property to the input component.
function withTheme(BaseComponent) {
  var factory = (0, _createEagerFactory2.default)(BaseComponent);

  var WithTheme = function WithTheme(ownerProps, context) {
    return factory((0, _extends3.default)({ theme: context.styleManager.theme }, ownerProps));
  };

  WithTheme.contextTypes = {
    styleManager: _customPropTypes2.default.muiRequired
  };
  WithTheme.displayName = (0, _wrapDisplayName2.default)(BaseComponent, 'withTheme');

  return WithTheme;
} //  weak